import type { ReactNode } from "react";

export function AdminContent({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
}
