import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";
import {
  checkPaths,
  checkVercel,
  checkVite,
  matchContract,
  matchVercel,
  matchVite,
  pathCases,
  validateContract,
} from "./check-api-routes.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const contract = await readJson("../config/api-routes.json");
const routes = validateContract(contract);
const vercel = await readJson("../vercel.json");

test("the contract resolves all request examples", () => {
  assert.deepEqual(checkPaths("Contract", (request) => matchContract(routes, request)), {
    passed: pathCases.length,
    issues: [],
  });
});

test("invalid, duplicate and incorrectly prioritized contract routes fail validation", async () => {
  for (const mutate of [
    ({ routes }) => { delete routes[0].rewrite; },
    ({ routes }) => { routes[0].service = "other"; },
    ({ routes }) => { routes[0].path = "/api/*"; },
    ({ routes }) => { routes[1].id = routes[0].id; },
    ({ routes }) => { routes[1].priority = routes[0].priority; },
    ({ routes }) => { routes[2].path = routes[1].path; },
    ({ routes }) => {
      routes.unshift(routes.pop());
      routes.forEach((route, index) => { route.priority = index + 1; });
    },
  ]) {
    const copy = await readJson("../config/api-routes.json");
    mutate(copy);
    assert.throws(() => validateContract(copy));
  }
});

test("Vite matching follows first match and exposes overly broad prefixes", () => {
  const proxy = {
    "/api": { target: "http://core.test", rewrite: (url) => url.slice(4) },
    "^/api/v1/rights-records(?:[?]|$)": { target: "http://gateway.test" },
  };
  assert.deepEqual(matchVite(proxy, "/api/v1/rights-records?q=x&q=y"), {
    origin: "http://core.test",
    path: "/v1/rights-records?q=x&q=y",
  });
  assert.ok(matchVite(proxy, "/apiary"));
  assert.ok(checkVite(routes, proxy).some((issue) => issue.includes("Unrecorded")));
});

test("a Vite configuration that follows the contract passes both checks", () => {
  const gateway = { target: "http://115.159.121.83", changeOrigin: true };
  const proxy = {
    "^/api/v1/announcements(?:[/?]|$)": gateway,
    "^/api/v1/rights-records(?:[?]|$)": gateway,
    "^/api/v1/votes(?:[?]|$)": gateway,
    "^/api/v1/votes/[^/?]+/submit(?:[?]|$)": gateway,
    "^/api/v1/daily-quotes/by-date(?:[?]|$)": gateway,
    "^/api(?:[/?]|$)": { target: "http://115.159.121.83:8001", changeOrigin: true, rewrite: (url) => url.slice(4) },
  };
  assert.deepEqual(checkVite(routes, proxy), []);

  for (const [key, id] of [
    ["^/api/v1/announcements(?:[/?]|$)", "announcements"],
    ["^/api(?:[/?]|$)", "core-api"],
  ]) {
    const missing = { ...proxy[key] };
    delete missing.changeOrigin;
    assert.deepEqual(checkVite(routes, { ...proxy, [key]: missing }), [
      `Missing changeOrigin for ${id}: set changeOrigin: true`,
    ]);

    for (const value of [false, "true"]) {
      const invalid = { ...proxy[key], changeOrigin: value };
      assert.deepEqual(checkVite(routes, { ...proxy, [key]: invalid }), [
        `Invalid changeOrigin for ${id}: expected true`,
      ]);
    }
  }
  assert.deepEqual(checkPaths("Vite", (request) => matchVite(proxy, request)), {
    passed: pathCases.length,
    issues: [],
  });
  const fallbackFirst = { "^/api(?:[/?]|$)": proxy["^/api(?:[/?]|$)"], ...proxy };
  assert.ok(checkVite(routes, fallbackFirst).some((issue) => issue.includes("Core fallback precedes")));
});

test("rewrites that strip twice or lose query values fail path checks", () => {
  for (const request of ["/api/api/sign/add", "/api/sign/add?next=%2Fapi%2Fsign&tag=a&tag=b"]) {
    const result = checkPaths("Vite", (path) => {
      if (path !== request) return matchContract(routes, path);
      return matchVite({ "/api": { target: "http://115.159.121.83:8001",
        rewrite: () => "/sign/add" } }, path);
    });
    assert.equal(result.passed, pathCases.length - 1);
    assert.match(result.issues[0], /^\/api/);
  }
});

test("production rewrites match all examples including the SPA fallback", () => {
  assert.deepEqual(checkVercel(routes, vercel), []);
  assert.deepEqual(checkPaths("Vercel", (request) => matchVercel(vercel.rewrites, request)), {
    passed: pathCases.length,
    issues: [],
  });
});

test("reordered and unrecorded production rules and changed SPA fallback fail", async () => {
  for (const mutate of [
    ({ rewrites }) => { rewrites.unshift(rewrites.splice(-2, 1)[0]); },
    ({ rewrites }) => { rewrites.splice(-1, 0, { source: "/api/extra", destination: "/extra" }); },
    ({ rewrites }) => { rewrites.at(-1).destination = "/other.html"; },
  ]) {
    const copy = await readJson("../vercel.json");
    mutate(copy);
    assert.notEqual(checkVercel(routes, copy).length, 0);
  }
});
