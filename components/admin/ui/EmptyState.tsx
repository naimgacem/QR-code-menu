import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  children,
  action,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${
          tone === "danger"
            ? "bg-danger-soft text-danger"
            : "bg-accent-soft text-accent-strong"
        }`}
      >
        {icon}
      </span>
      <p className="mt-4 text-[16px] font-semibold tracking-tight text-fg">
        {title}
      </p>
      {children && (
        <div className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
          {children}
        </div>
      )}
      {action && <div className="mt-6 flex justify-center gap-2">{action}</div>}
    </div>
  );
}
