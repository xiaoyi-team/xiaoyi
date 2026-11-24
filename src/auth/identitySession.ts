export function createIdentitySession<User>(
  readAuthorization: () => string | null,
  loadUser: (signal: AbortSignal, isCurrent: () => boolean) => Promise<User>,
) {
  let version = 0;
  let authorization = readAuthorization();
  let pending: { controller: AbortController; result: Promise<User> } | undefined;

  function cancel() {
    pending?.controller.abort();
    pending = undefined;
  }

  function advance() {
    version += 1;
    cancel();
    return version;
  }

  return {
    get version() { return version; },
    advance,
    cancel,
    adoptAuthorization() {
      authorization = readAuthorization();
    },
    syncAuthorization() {
      const current = readAuthorization();
      if (current === authorization) return false;
      authorization = current;
      advance();
      return true;
    },
    isCurrent(expectedVersion: number) {
      return expectedVersion === version && authorization === readAuthorization();
    },
    load() {
      if (pending) return pending.result;
      const controller = new AbortController();
      const requestVersion = version;
      const requestAuthorization = authorization;
      const result = loadUser(controller.signal, () =>
        requestVersion === version && requestAuthorization === readAuthorization()
      ).finally(() => {
        if (pending?.controller === controller) pending = undefined;
      });
      pending = { controller, result };
      return result;
    },
  };
}
