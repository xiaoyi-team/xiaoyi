import { useLocation, useNavigate } from "react-router";

// URLSearchParams decodes the redirect query parameter exactly once.
export function getSafeRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return "/home";
  if (Array.from(target).some(c => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127 || c === "\\")) return "/home";
  try {
    const url = new URL(target, "https://auth.invalid");
    const path = decodeURIComponent(url.pathname).replace(/\\/g, "/");
    if (url.origin !== "https://auth.invalid" || path.startsWith("//") || /^\/login(?:\/|$)/i.test(path)) return "/home";
    return url.pathname + url.search + url.hash;
  } catch { return "/home"; }
}
export function useGoLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  return () => navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`);
}
