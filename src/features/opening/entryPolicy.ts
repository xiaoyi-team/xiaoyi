/** A document arrival is distinct from a client-side route change. */
export function shouldShowOpening(path: string, navigationType: string, referrer: string, origin: string) {
  if (path !== "/" && path !== "/home") return false;
  if (navigationType === "reload" || navigationType === "back_forward") return false;
  if (referrer) {
    try {
      if (new URL(referrer).origin === origin) return false;
    } catch { /* An invalid referrer is treated as a direct arrival. */ }
  }
  return true;
}
