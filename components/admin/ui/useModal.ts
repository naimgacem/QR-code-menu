"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open layers, innermost last. Only the top one handles keys, so Escape in
 * a confirm dialog rendered inside a sheet closes the dialog, not both. */
const stack: symbol[] = [];

type Options = {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement>;
  /** Receives focus on open. Defaults to the panel itself. */
  initialFocusRef?: RefObject<HTMLElement>;
  /** While true, Escape is ignored — e.g. mid-delete, when closing would
   * orphan the pending request's feedback. */
  locked?: boolean;
};

/**
 * Shared behaviour for everything that sits above the page: dialogs, bottom
 * sheets and the photo editor. Locks body scroll, closes on Escape, keeps
 * Tab inside the panel, and hands focus back to whatever opened it.
 *
 * Nested modals (the delete confirm inside a sheet, say) work because each
 * layer restores the overflow value it found, in reverse order.
 */
export function useModal({
  open,
  onClose,
  panelRef,
  initialFocusRef,
  locked = false,
}: Options) {
  // Read through refs so a parent re-rendering with a new inline callback
  // doesn't tear down and re-run the whole effect (and steal focus back).
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(locked);
  onCloseRef.current = onClose;
  lockedRef.current = locked;

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const id = Symbol("modal");
    stack.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel || stack[stack.length - 1] !== id) return;

      if (e.key === "Escape" && !lockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const raf = requestAnimationFrame(() => {
      (initialFocusRef?.current ?? panelRef.current)?.focus({
        preventScroll: true,
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      stack.splice(stack.indexOf(id), 1);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, panelRef, initialFocusRef]);
}
