"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

/** Shared input chrome. The 16px phone font is not a style choice — anything
 * smaller makes iOS Safari zoom the viewport when the field takes focus. It
 * drops to desktop density from `md` up, where that zoom doesn't exist. */
export const controlClass = (invalid?: boolean) =>
  [
    "w-full rounded-[10px] border bg-surface px-3.5 text-[16px] text-fg md:text-[14.5px]",
    "shadow-admin-xs placeholder:text-subtle/80",
    "transition-[border-color,box-shadow] duration-150",
    "focus:outline-none focus:ring-4",
    "disabled:cursor-not-allowed disabled:opacity-60",
    invalid
      ? "border-danger focus:border-danger focus:ring-danger/15"
      : "border-line hover:border-subtle/50 focus:border-accent focus:ring-accent/15",
  ].join(" ");

type Shell = {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  /** Marks the field "Facultatif". Optional fields are the exception on
   * these forms, so they carry the tag rather than required ones carrying
   * an asterisk. */
  optional?: boolean;
  /** Live character counter, shown at the end of the label row. */
  count?: { value: number; max: number };
  /** Rendered flush to the field's inner end — e.g. the "DA" price suffix. */
  suffix?: ReactNode;
  /** Rendered flush to the field's inner start — typically an icon. */
  prefix?: ReactNode;
};

function Counter({ value, max }: { value: number; max: number }) {
  const left = max - value;
  const tone =
    left < 0 ? "text-danger" : left <= max * 0.1 ? "text-warning" : "text-subtle";
  return (
    <span className={`text-[12px] tabular-nums ${tone}`} aria-hidden="true">
      {value}/{max}
    </span>
  );
}

function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  count,
  children,
}: Shell & { id: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13.5px] font-medium text-fg">
          {label}
          {optional && (
            <span className="ms-1.5 text-[12px] font-normal text-subtle">
              Facultatif
            </span>
          )}
        </label>
        {count && <Counter {...count} />}
      </div>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-danger"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-px h-3.5 w-3.5 flex-shrink-0"
            fill="currentColor"
          >
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5Zm0 5.25a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-[12.5px] leading-snug text-subtle"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string | null, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

// ---------------------------------------------------------------------------

type TextFieldProps = Shell &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "prefix">;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hint, error, required, optional, count, suffix, prefix, ...rest },
    ref
  ) {
    const id = useId();
    return (
      <FieldShell
        id={id}
        label={label}
        hint={hint}
        error={error}
        optional={optional}
        count={count}
      >
        <div className="relative">
          {prefix && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-subtle"
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, error, hint)}
            className={`${controlClass(Boolean(error))} h-11 ${
              suffix ? "pe-14" : ""
            } ${prefix ? "ps-10" : ""}`}
            {...rest}
          />
          {suffix && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle"
            >
              {suffix}
            </span>
          )}
        </div>
      </FieldShell>
    );
  }
);

type TextAreaProps = Shell &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextAreaField(
    { label, hint, error, required, optional, count, rows = 3, ...rest },
    ref
  ) {
    const id = useId();
    return (
      <FieldShell
        id={id}
        label={label}
        hint={hint}
        error={error}
        optional={optional}
        count={count}
      >
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClass(Boolean(error))} min-h-[96px] resize-y py-2.5 leading-relaxed`}
          {...rest}
        />
      </FieldShell>
    );
  }
);

type SelectProps = Shell & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  name?: string;
};

export function SelectField({
  label,
  hint,
  error,
  required,
  optional,
  value,
  onChange,
  options,
  disabled,
  name,
}: SelectProps) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
    >
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClass(Boolean(error))} h-11 cursor-pointer appearance-none pe-10`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute inset-y-0 end-3.5 my-auto h-4 w-4 text-subtle"
        >
          <path
            d="m7 10 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </FieldShell>
  );
}
