"use client";

import { useRef } from "react";
import { AlertIcon } from "../icons";
import { Button } from "./Button";
import { Portal } from "./Portal";
import { useModal } from "./useModal";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Blocking confirmation for destructive actions.
 *
 * Focus lands on CANCEL, not confirm — the whole point is that deleting a
 * dish (and its photo) can't be done by reflexively tapping through.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useModal({
    open,
    onClose: onCancel,
    panelRef,
    initialFocusRef: cancelRef,
    locked: loading,
  });

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-4">
        <div
          aria-hidden="true"
          onClick={() => !loading && onCancel()}
          className="absolute inset-0 animate-admin-fade bg-app/70 backdrop-blur-[3px]"
        />

        <div
          ref={panelRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          className="relative w-full max-w-[400px] animate-admin-sheet rounded-2xl border border-line bg-surface-overlay p-5 shadow-admin-lg sm:animate-admin-pop sm:p-6"
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full ${
                tone === "danger"
                  ? "bg-danger-soft text-danger"
                  : "bg-accent-soft text-accent-strong"
              }`}
            >
              <AlertIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id="confirm-title"
                className="text-[16.5px] font-semibold leading-snug tracking-tight text-fg"
              >
                {title}
              </h2>
              <p
                id="confirm-message"
                className="mt-1.5 text-[13.5px] leading-relaxed text-muted"
              >
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              ref={cancelRef}
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="sm:min-w-[110px]"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={tone}
              onClick={onConfirm}
              loading={loading}
              className="sm:min-w-[110px]"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
