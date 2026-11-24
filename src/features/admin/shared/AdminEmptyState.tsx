import type { ReactNode } from "react";

export function AdminEmptyState({ title, description, action, icon }: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#dce3ed] bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
      {icon && <div aria-hidden="true" className="mx-auto grid size-12 place-items-center rounded-xl bg-[#edf2f8] text-2xl text-[#647b9b]">{icon}</div>}
      <h2 className={`text-base font-semibold ${icon ? "mt-5" : ""}`}>{title}</h2>
      {description && <p className="mt-2 text-sm leading-6 text-[#64748b]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
