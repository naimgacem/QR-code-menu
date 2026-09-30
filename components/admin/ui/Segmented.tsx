"use client";

import type { ReactNode } from "react";

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Shown as a small trailing number — e.g. how many dishes a filter hits. */
  count?: number;
};

/**
 * Pill-group selector: list filters, editor tabs, the theme switch. One
 * visible choice among a few, with the active one lifted onto a surface.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  fullWidth = false,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  size?: "sm" | "md";
  /** Stretch to the container — always, or only below `md` (phones get
   * equal-width segments that can't overflow; desktop sizes to content). */
  fullWidth?: boolean | "mobile";
}) {
  const stretch =
    fullWidth === "mobile"
      ? { group: "flex w-full md:inline-flex md:w-auto", item: "flex-1 md:flex-none" }
      : fullWidth
        ? { group: "flex w-full", item: "flex-1" }
        : { group: "inline-flex", item: "" };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`gap-0.5 rounded-xl bg-surface-2 p-1 ${stretch.group}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex flex-shrink-0 touch-manipulation items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-[background-color,color,box-shadow] duration-150 ${
              size === "sm"
                ? "h-8 px-2.5 text-[12.5px]"
                : "h-10 px-3 text-[14px] md:h-9 md:text-[13px]"
            } ${stretch.item} ${
              active
                ? "bg-surface text-fg shadow-admin-sm"
                : "text-muted hover:text-fg"
            }`}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span
                className={`min-w-[18px] rounded-full px-1 text-[11px] tabular-nums ${
                  active ? "bg-surface-2 text-muted" : "text-subtle"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
