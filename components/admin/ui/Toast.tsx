"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertIcon, CheckIcon, CloseIcon } from "../icons";

type ToastTone = "success" | "error";
type ToastAction = { label: string; onClick: () => void };
type ToastOptions = { action?: ToastAction };
type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
  action?: ToastAction;
};

const AUTO_DISMISS_MS = 4200;
/** Toasts offering "Annuler" linger — undo is useless if it vanishes
 * before the owner has read what happened. */
const WITH_ACTION_MS = 6500;
/** Older toasts are dropped past this — a stack taller than the phone is
 * worse than losing the oldest message. */
const MAX_VISIBLE = 3;

type Ctx = {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) =>
        [...prev, { id, tone, message, action: options?.action }].slice(
          -MAX_VISIBLE
        )
      );
      timers.current.set(
        id,
        setTimeout(
          () => dismiss(id),
          options?.action ? WITH_ACTION_MS : AUTO_DISMISS_MS
        )
      );
    },
    [dismiss]
  );

  const value = useMemo<Ctx>(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* aria-live so the outcome of a save is announced, not just seen.
       * Bottom of the screen on phones — above the tab bar, where the thumb
       * already is — and bottom-right on desktop. pointer-events-none on
       * the container keeps it from swallowing taps underneath. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[110] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-[380px] animate-admin-toast items-center gap-3 rounded-xl border border-line bg-surface-overlay py-2.5 pe-2 ps-3.5 text-fg shadow-admin-lg"
          >
            <span
              className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full ${
                toast.tone === "success"
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
              }`}
            >
              {toast.tone === "success" ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <AlertIcon className="h-3.5 w-3.5" />
              )}
            </span>
            <p className="min-w-0 flex-1 py-1 text-[13.5px] font-medium leading-snug">
              {toast.message}
            </p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
                className="h-8 flex-shrink-0 touch-manipulation rounded-lg px-2.5 text-[13px] font-semibold text-accent-strong transition-colors hover:bg-accent-soft"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fermer la notification"
              className="grid h-8 w-8 flex-shrink-0 touch-manipulation place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
