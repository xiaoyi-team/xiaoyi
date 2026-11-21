import console from "node:console";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import process from "node:process";
import { loadConfigFromFile } from "vite";

// Current deployment origins. Keep this inventory out of the platform-neutral contract.
const origins = {
  gateway: "http://115.159.121.83",
  core: "http://115.159.121.83:8001",
};

const root = fileURLToPath(new URL("../", import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const quoteRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripApi = (path) => path.slice(4) || "/";

export function compilePath(path, type) {
  const segments = path.split("/").slice(1);
  const wildcard = type === "prefix" && segments.pop() === ":path*";
  const parameter = type === "template";
  if (
    !["exact", "prefix", "template"].includes(type) ||
    !path.startsWith("/") || segments[0] !== "api" ||
    (type === "prefix" && !wildcard) ||
    segments.filter((part) => part === ":id").length !== Number(parameter) ||
    !segments.every((part) => /^[\w-]+$/.test(part) || (parameter && part === ":id"))
  ) {
    throw new Error(`Invalid ${type} API pattern: ${path}`);
  }
  const body = segments.map((part) => part === ":id" ? "[^/]+" : quoteRegex(part)).join("/");
  return new RegExp(`^/${body}${wildcard ? "(?:/.*)?" : ""}$`);
}

export function validateContract(contract) {
  const { services, routes } = contract;
  if (!Array.isArray(services) || services.length !== 2 ||
      !Object.keys(origins).every((service) => services.includes(service)) ||
      !Array.isArray(routes) || routes.length === 0) {
    throw new Error("Expected gateway and core services and a nonempty route array");
  }

  const ids = new Set();
  const patterns = new Set();
  let lastPriority = 0;
  const compiled = routes.map((route) => {
    const { id, path, match, service, priority, rewrite, preserveApiPrefix } = route;
    if (typeof id !== "string" || !/^[a-z][a-z0-9-]*$/.test(id) || ids.has(id) ||
        typeof path !== "string" || !services.includes(service) ||
        !Number.isSafeInteger(priority) || priority <= lastPriority ||
        typeof preserveApiPrefix !== "boolean" ||
        rewrite !== (preserveApiPrefix ? "preserve" : "strip-api-prefix")) {
      throw new Error(`Invalid or duplicate route, or non-increasing priority: ${id}`);
    }
    const matcher = compilePath(path, match);
    if (patterns.has(matcher.source)) throw new Error(`Duplicate route pattern: ${path}`);
    const example = path.replace("/:path*", "").replace(":id", "123");
    if (compiledMatch(routes, example, priority)) {
      throw new Error(`Route is shadowed by an earlier rule: ${path}`);
    }
    ids.add(id);
    patterns.add(matcher.source);
    lastPriority = priority;
    return { ...route, matcher };
  });

  const fallback = compiled.at(-1);
  if (fallback.path !== "/api/:path*" || fallback.service !== "core" || fallback.preserveApiPrefix ||
      compiled.slice(0, -1).some((route) => route.path === fallback.path ||
        route.service !== "gateway" || !route.preserveApiPrefix)) {
    throw new Error("Expected gateway preserve rules followed by the core /api fallback");
  }
  return compiled;
}

function compiledMatch(routes, path, priority) {
  return routes.some((route) => route.priority < priority && compilePath(route.path, route.match).test(path));
}

function splitRequest(request) {
  const index = request.indexOf("?");
  return index < 0 ? [request, ""] : [request.slice(0, index), request.slice(index)];
}

export function matchContract(routes, request) {
  const [path, query] = splitRequest(request);
  const route = routes.find(({ matcher }) => matcher.test(path));
  if (!route) return null;
  return { origin: origins[route.service], path: (route.preserveApiPrefix ? path : stripApi(path)) + query };
}

export function matchVite(proxy, request) {
  const rule = Object.entries(proxy).find(([key]) =>
    key.startsWith("^") ? new RegExp(key).test(request) : request.startsWith(key));
  if (!rule) return null;
  const [, value] = rule;
  const { target, rewrite } = typeof value === "string" ? { target: value } : value;
  const origin = new URL(target);
  const path = rewrite ? rewrite(request) : request;
  const requestPath = path === "" || path.startsWith("?") ? `/${path}` : path;
  return { origin: origin.origin, path: origin.pathname.replace(/\/$/, "") + requestPath };
}

const spaSource = "/(.*)";
export function matchVercel(rewrites, request) {
  const [path, query] = splitRequest(request);
  for (const { source, destination } of rewrites) {
    if (source === spaSource) return { spa: destination };
    const type = source.endsWith("/:path*") ? "prefix" : source.includes("/:id/") ? "template" : "exact";
    if (!compilePath(source, type).test(path)) continue;

    const id = path.split("/")[4];
    const suffix = path.slice(source.slice(0, -"/:path*".length).length + 1);
    const expanded = type === "prefix" ? destination.replace("/:path*", () => suffix ? `/${suffix}` : "")
      : type === "template" ? destination.replace(":id", () => id) : destination;
    const target = new URL(expanded);
    return { origin: target.origin, path: target.pathname + target.search + query };
  }
  return null;
}

function viteKey(route) {
  // Vite evaluates regexes against the request URL, including its raw query.
  const source = route.matcher.source.replaceAll("\\/", "/").replace("[^/]+", "[^/?]+");
  if (route.match === "prefix") return source.replace("(?:/.*)?$", "(?:[/?]|$)");
  return source.replace(/\$$/, "(?:[?]|$)");
}

export function checkVite(routes, proxy) {
  const issues = [];
  const keys = Object.keys(proxy);
  const allowed = new Map(routes.map((route) => [viteKey(route), route]));
  for (const key of keys) {
    if (!allowed.has(key)) issues.push(`Unrecorded or different proxy matcher: ${key}`);
  }

  const fallbackIndex = keys.indexOf(viteKey(routes.at(-1)));
  for (const route of routes) {
    const key = viteKey(route);
    if (!Object.hasOwn(proxy, key)) {
      issues.push(`Missing contract matcher for ${route.id}: ${key}`);
      continue;
    }
    const options = typeof proxy[key] === "string" ? { target: proxy[key] } : proxy[key];
    if (!Object.hasOwn(options, "changeOrigin")) {
      issues.push(`Missing changeOrigin for ${route.id}: set changeOrigin: true`);
    } else if (options.changeOrigin !== true) {
      issues.push(`Invalid changeOrigin for ${route.id}: expected true`);
    }
    if (options.target !== origins[route.service] ||
        Object.keys(options).some((name) => !["target", "changeOrigin", "rewrite"].includes(name)) ||
        (route.preserveApiPrefix ? options.rewrite !== undefined : typeof options.rewrite !== "function")) {
      issues.push(`Unexpected target, option or rewrite for ${route.id}`);
    }
    if (route.service === "gateway" && fallbackIndex >= 0 && keys.indexOf(key) > fallbackIndex) {
      issues.push(`Core fallback precedes ${route.id}`);
    }
  }
  return issues;
}

export function checkVercel(routes, config) {
  const { rewrites } = config;
  if (!Array.isArray(rewrites)) return ["Expected a rewrites array"];
  const issues = [];
  for (const [index, route] of routes.entries()) {
    const expectedPath = route.preserveApiPrefix ? route.path : stripApi(route.path);
    const expected = origins[route.service] + expectedPath;
    const rule = rewrites[index];
    if (!rule || rule.source !== route.path || rule.destination !== expected ||
        Object.keys(rule).some((key) => key !== "source" && key !== "destination")) {
      issues.push(`Rewrite ${index + 1} must be ${route.path} -> ${expected}`);
    }
  }
  const fallback = rewrites[routes.length];
  if (rewrites.length !== routes.length + 1 || fallback?.source !== spaSource ||
      fallback?.destination !== "/index.html" || Object.keys(fallback).length !== 2) {
    issues.push("Expected exactly one final SPA fallback and no unrecorded rewrites");
  }
  if (config.routes || config.redirects?.length) {
    issues.push("Unmodeled Vercel routes or redirects may change API matching");
  }
  return issues;
}

export const pathCases = [
  ["/api/v1/rights-records", "gateway"],
  ["/api/v1/rights-records?category_id=1&keyword=test", "gateway"],
  ["/api/v1/announcements/active", "gateway"],
  ["/api/v1/announcements/popup-status", "gateway"],
  ["/api/v1/announcements", "gateway"],
  ["/api/v1/votes", "gateway"],
  ["/api/v1/votes/123/submit", "gateway"],
  ["/api/v1/daily-quotes/by-date?date=2026-11-22", "gateway"],
  ["/api/sign/add", "core", "/sign/add"],
  ["/api/sign/award/list", "core", "/sign/award/list"],
  ["/api/candy/goods/list", "core", "/candy/goods/list"],
  ["/api/support_record/timeline/list", "core", "/support_record/timeline/list"],
  ["/api/v1/rights-records/other", "core", "/v1/rights-records/other"],
  ["/api/v1/votes/123/other", "core", "/v1/votes/123/other"],
  ["/api/v1/votes/123/submit/other", "core", "/v1/votes/123/submit/other"],
  ["/api/v1/announcements-extra?next=/api/v1/votes", "core", "/v1/announcements-extra?next=/api/v1/votes"],
  ["/api/sign/add?next=%2Fapi%2Fsign&tag=a&tag=b", "core", "/sign/add?next=%2Fapi%2Fsign&tag=a&tag=b"],
  ["/api/api/sign/add", "core", "/api/sign/add"],
  ["/api", "core", "/"],
  ["/apiary/v1/votes", null],
  ["/home", null],
];

export function checkPaths(label, match) {
  let passed = 0;
  const issues = [];
  for (const [request, service, upstream = request] of pathCases) {
    const expected = service ? { origin: origins[service], path: upstream }
      : label === "Vercel" ? { spa: "/index.html" } : null;
    try {
      const actual = match(request);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        issues.push(`${request}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      } else {
        passed += 1;
      }
    } catch (error) {
      issues.push(`${request}: ${error.message}`);
    }
  }
  return { passed, issues };
}

async function main() {
  const routes = validateContract(await readJson("../config/api-routes.json"));
  const vercel = await readJson("../vercel.json");
  const loaded = await loadConfigFromFile(
    { command: "serve", mode: "development", isPreview: false },
    fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
    root,
  );
  if (!loaded?.config.server?.proxy) throw new Error("Vite server.proxy is missing");
  const proxy = loaded.config.server.proxy;
  const results = [
    ["Contract", [], (request) => matchContract(routes, request)],
    ["Vite", checkVite(routes, proxy), (request) => matchVite(proxy, request)],
    ["Vercel", checkVercel(routes, vercel), (request) => matchVercel(vercel.rewrites, request)],
  ];

  for (const [label, configIssues, match] of results) {
    const { passed, issues } = checkPaths(label, match);
    console.log(`${label}: ${passed}/${pathCases.length} path cases, ${configIssues.length} configuration issues`);
    for (const issue of [...configIssues, ...issues]) console.error(`  ${label}: ${issue}`);
    if (configIssues.length || issues.length) process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
