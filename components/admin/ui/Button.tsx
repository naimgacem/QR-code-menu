import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-action-fg shadow-admin-xs hover:bg-action-hover",
  secondary:
    "bg-surface text-fg border border-line shadow-admin-xs hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-danger-fg shadow-admin-xs hover:bg-danger-hover",
  "danger-ghost": "text-danger hover:bg-danger-soft",
};

/** 44px tall on phones — the dashboard is used one-handed, often standing
 * in a kitchen — tightening to desktop density from `md` up. */
const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 md:h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 md:h-10 px-4 text-[14px] gap-2 rounded-[10px]",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
};

const BASE = [
  "inline-flex select-none items-center justify-center whitespace-nowrap",
  "font-medium touch-manipulation",
  "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150",
  "active:scale-[0.98]",
  "disabled:pointer-events-none disabled:opacity-50",
].join(" ");

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string
) {
  return [BASE, VARIANTS[variant], SIZES[size], extra ?? ""]
    .filter(Boolean)
    .join(" ");
}

/** Square, icon-only control — toolbar buttons, row actions, close. */
export function iconButtonClass(size: "sm" | "md" = "md", extra?: string) {
  return [
    "inline-grid flex-shrink-0 place-items-center touch-manipulation text-muted",
    "transition-[background-color,color,transform] duration-150",
    "hover:bg-surface-2 hover:text-fg active:scale-95",
    "disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-[10px]",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const Spinner = ({ className = "" }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  /** Rendered before the label; swapped for a spinner while `loading` so
   * the width stays stable. */
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    icon,
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(
        variant,
        size,
        [fullWidth ? "w-full" : "", className ?? ""].filter(Boolean).join(" ")
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
});
