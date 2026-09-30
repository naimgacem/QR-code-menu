"use client";

import { useId } from "react";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

/** Bare switch control — used on its own in list rows, and inside
 * `<Switch>` for labelled form rows. The admin is pinned LTR, so the knob
 * can travel with a physical translate. */
export function Toggle({
  checked,
  onChange,
  size = "md",
  disabled,
  ...aria
}: ToggleProps) {
  const track = size === "sm" ? "h-6 w-10" : "h-7 w-12";
  const knob = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const travel = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      // The ::before pad grows the tap target to ~44px (Apple's minimum)
      // without changing the switch's drawn size.
      className={`relative inline-flex flex-shrink-0 touch-manipulation items-center rounded-full p-0.5 transition-colors duration-200 before:absolute before:-inset-x-2 before:-inset-y-2.5 before:content-[''] disabled:opacity-50 ${track} ${
        checked ? "bg-action" : "bg-surface-muted ring-1 ring-inset ring-line"
      }`}
      {...aria}
    >
      <span
        aria-hidden="true"
        className={`rounded-full bg-surface shadow-admin-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${knob} ${
          checked ? travel : "translate-x-0"
        }`}
      />
    </button>
  );
}

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

/** Labelled toggle row. The whole row is the hit target — the thumb alone
 * is fiddly to hit one-handed. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: Props) {
  const id = useId();

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-line-soft bg-surface-2/40 px-4 py-3.5 transition-colors hover:bg-surface-2/70"
    >
      <span className="min-w-0 flex-1">
        <label
          htmlFor={id}
          // The row already toggles; without this a label click would
          // toggle twice (row handler + the label's forwarded click).
          onClick={(e) => e.preventDefault()}
          className="block cursor-pointer text-[14px] font-medium leading-snug text-fg"
        >
          {label}
        </label>
        {description && (
          <span
            id={`${id}-description`}
            className="mt-0.5 block text-[12.5px] leading-snug text-subtle"
          >
            {description}
          </span>
        )}
      </span>

      <span onClick={(e) => e.stopPropagation()}>
        <Toggle
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={description ? `${id}-description` : undefined}
        />
      </span>
    </div>
  );
}
