"use client";

import { useId, type CSSProperties } from "react";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Formats the value readout, e.g. `v => \`${v}°\``. */
  format?: (value: number) => string;
  /** Where the filled part of the track starts. Sliders centred on zero
   * (contrast, straighten) fill outward from the middle. */
  origin?: number;
  /** Value restored on double-click of the label — the photo-editor
   * convention for "reset this one slider". */
  resetValue?: number;
  disabled?: boolean;
  /** Pointer/key down and release — lets the caller show extra guides
   * (the straighten grid) only while the slider is in use. */
  onStart?: () => void;
  onCommit?: () => void;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
  origin = min,
  resetValue,
  disabled,
  onStart,
  onCommit,
}: Props) {
  const id = useId();
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const from = Math.min(pct(origin), pct(value));
  const to = Math.max(pct(origin), pct(value));

  const style = {
    "--track": `linear-gradient(to right, rgb(var(--line)) 0 ${from}%, rgb(var(--accent)) ${from}% ${to}%, rgb(var(--line)) ${to}% 100%)`,
  } as CSSProperties;

  const changed = resetValue !== undefined && value !== resetValue;

  return (
    <div className={disabled ? "opacity-50" : ""}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          onDoubleClick={() =>
            resetValue !== undefined && onChange(resetValue)
          }
          title={resetValue !== undefined ? "Double-cliquez pour réinitialiser" : undefined}
          className="select-none text-[13px] font-medium text-fg"
        >
          {label}
        </label>
        <span
          className={`text-[12.5px] tabular-nums ${
            changed ? "text-accent-strong" : "text-subtle"
          }`}
        >
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={onStart}
        onKeyDown={onStart}
        onPointerUp={onCommit}
        onPointerCancel={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
        style={style}
        className="admin-range mt-1"
      />
    </div>
  );
}
