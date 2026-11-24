import type { ReactNode } from "react";

export function AdminErrorState({ title, description, onRetry, back }: {
  title: string;
  description?: string;
  onRetry?: () => void;
  back?: ReactNode;
}) {
  return (
    <section role="alert" className="rounded-xl border border-[#e8d4d4] bg-white p-6">
      <h2 className="font-semibold text-[#713b3b]">{title}</h2>
      {description && <p className="mt-2 text-sm leading-6 text-[#64748b]">{description}</p>}
      {(onRetry || back) && <div className="mt-4 flex flex-wrap items-center gap-3">
        {onRetry && <button type="button" onClick={onRetry} className="min-h-11 rounded-lg px-3 text-[#31578d] underline focus-visible:outline-2 focus-visible:outline-offset-2">重试</button>}
        {back}
      </div>}
    </section>
  );
}
