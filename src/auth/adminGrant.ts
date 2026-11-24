import type { CurrentUser } from "../types/auth";

type IdentitySession = {
  readonly version: number;
  isCurrent(version: number): boolean;
};

export interface AdminGrant {
  revision: number;
  isCurrent: () => boolean;
}

export function isAdminUser(user: CurrentUser | null): boolean {
  return user !== null && typeof user === "object" && !Array.isArray(user) && user.is_admin === true;
}

export function createAdminGrantTracker(session: IdentitySession) {
  let current: AdminGrant | null = null;
  let revision = 0;

  return {
    update(user: CurrentUser | null): AdminGrant | null {
      const version = session.version;
      if (!isAdminUser(user) || !session.isCurrent(version)) {
        current = null;
        return null;
      }
      if (current?.isCurrent()) return current;

      const grant: AdminGrant = {
        revision: ++revision,
        isCurrent: () => current === grant && session.isCurrent(version),
      };
      current = grant;
      return grant;
    },
  };
}
