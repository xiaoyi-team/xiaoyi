import type { ReactNode } from "react";

export function AdminPageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-[#263652] sm:text-3xl">{title}</h1>
        {description && <p className="mt-3 text-base leading-7 text-[#64748b]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
