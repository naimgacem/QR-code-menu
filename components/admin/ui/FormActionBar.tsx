"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Kbd } from "./Badge";

type Props = {
  dirty: boolean;
  pending: boolean;
  submitLabel: string;
  onCancel: () => void;
  /** In edit mode a clean form has nothing to save; in create mode the
   * button always works (and validation explains what's missing). */
  requireDirty?: boolean;
  /** Replaces the status text and blocks saving — e.g. a photo upload
   * still in flight, which would otherwise save the old image. */
  blockedReason?: string | null;
};

/**
 * Save / cancel for the edit screens.
 *
 * Phones: pinned to the bottom of the screen (the tab bar is hidden on
 * these pushed views), so saving never needs a scroll past a long form.
 * Desktop: a floating bar that sticks to the bottom of the form while it is
 * taller than the window, with a live "unsaved changes" status and the
 * keyboard shortcut.
 */
export function FormActionBar({
  dirty,
  pending,
  submitLabel,
  onCancel,
  requireDirty = false,
  blockedReason,
}: Props) {
  // Resolved after mount: the server can't know the owner's OS, and
  // guessing would mismatch on hydration.
  const [shortcut, setShortcut] = useState("Ctrl S");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘ S");
  }, []);

  const status = blockedReason
    ? blockedReason
    : dirty
      ? "Modifications non enregistrées"
      : "Aucune modification";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-surface/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:sticky md:inset-x-auto md:bottom-5 md:mt-8 md:rounded-2xl md:border md:border-line md:bg-surface-overlay/95 md:px-4 md:py-3 md:shadow-admin-lg">
      <div className="flex items-center gap-3">
        <p
          aria-live="polite"
          className="hidden min-w-0 flex-1 items-center gap-2 text-[13px] text-muted md:flex"
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors ${
              blockedReason
                ? "animate-pulse bg-accent"
                : dirty
                  ? "bg-warning"
                  : "bg-line"
            }`}
          />
          <span className="truncate">{status}</span>
        </p>
        <Kbd className="me-1">{shortcut}</Kbd>
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={pending}
          className="flex-1 md:flex-none"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={pending}
          disabled={Boolean(blockedReason) || (requireDirty && !dirty)}
          className="flex-[2] md:min-w-[150px] md:flex-none"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
