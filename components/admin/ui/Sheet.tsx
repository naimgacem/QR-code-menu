"use client";

import { useId, useRef, type ReactNode } from "react";
import { CloseIcon } from "../icons";
import { iconButtonClass } from "./Button";
import { Portal } from "./Portal";
import { useModal } from "./useModal";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Bottom sheet on phones, small centered dialog from `sm` up. Used for the
 * mobile "+" menu and the account menu — short lists of actions that don't
 * deserve their own page.
 */
export function Sheet({ open, onClose, title, description, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useModal({ open, onClose, panelRef });

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
        <div
          aria-hidden="true"
          onClick={onClose}
          className="absolute inset-0 animate-admin-fade bg-app/70 backdrop-blur-[3px]"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative w-full animate-admin-sheet rounded-t-[22px] border border-line bg-surface-overlay px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-admin-lg focus:outline-none sm:max-w-[380px] sm:animate-admin-pop sm:rounded-2xl sm:pb-3"
        >
          {/* Grab handle — a visual cue that this is a sheet; tapping the
           * backdrop or Escape closes it. */}
          <div
            aria-hidden="true"
            className="mx-auto mb-2 h-1 w-9 rounded-full bg-line sm:hidden"
          />
          <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-1">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[15.5px] font-semibold tracking-tight text-fg"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-0.5 truncate text-[12.5px] text-subtle">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className={iconButtonClass("sm", "-me-1 -mt-1")}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}

/** A tappable row inside a Sheet. */
export function SheetItem({
  icon,
  label,
  description,
  onClick,
  href,
  external,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  tone?: "default" | "danger";
}) {
  const className = `flex w-full touch-manipulation items-center gap-3.5 rounded-xl px-2.5 py-2.5 text-start transition-colors hover:bg-surface-2 active:bg-surface-2 ${
    tone === "danger" ? "text-danger" : "text-fg"
  }`;
  const body = (
    <>
      <span
        className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
          tone === "danger"
            ? "bg-danger-soft text-danger"
            : "bg-surface-2 text-muted"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium leading-snug">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-[12.5px] leading-snug text-subtle">
            {description}
          </span>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={className}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}
