import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent-strong",
};

/** Small status pill. `dot` prefixes a coloured dot — for live states
 * ("Visible", "Masqué") rather than labels. */
export function Badge({
  tone = "neutral",
  dot = false,
  children,
  className = "",
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-[22px] flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[11.5px] font-medium ${TONES[tone]} ${className}`}
    >
      {dot && (
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

/** Keyboard shortcut hint. Desktop-only by default — phones have no keys. */
export function Kbd({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={`hidden h-5 min-w-[20px] items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 font-sans text-[11px] font-medium text-subtle md:inline-flex ${className}`}
    >
      {children}
    </kbd>
  );
}
