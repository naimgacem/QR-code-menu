import type { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  description?: ReactNode;
  /** Right side of the header — a link, a badge, a small button. */
  action?: ReactNode;
  children: ReactNode;
  /** `none` for cards whose body is a flush list. */
  padding?: "default" | "none";
  className?: string;
  tone?: "default" | "danger";
};

/** The dashboard's basic container: every form section and list sits in
 * one, so the pages share a single rhythm. */
export function Card({
  title,
  description,
  action,
  children,
  padding = "default",
  className = "",
  tone = "default",
}: Props) {
  return (
    <section
      className={`rounded-2xl border bg-surface shadow-admin-xs ${
        tone === "danger" ? "border-danger/30" : "border-line-soft"
      } ${className}`}
    >
      {(title || action) && (
        <header
          className={`flex items-start justify-between gap-3 px-5 pt-4 ${
            padding === "none" ? "pb-3" : ""
          }`}
        >
          <div className="min-w-0">
            {title && (
              <h2
                className={`text-[15px] font-semibold tracking-tight ${
                  tone === "danger" ? "text-danger" : "text-fg"
                }`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      <div
        className={
          padding === "none" ? "" : title || action ? "p-5 pt-4" : "p-5"
        }
      >
        {children}
      </div>
    </section>
  );
}
