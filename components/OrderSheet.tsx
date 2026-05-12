"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { menu, type MenuItem } from "@/lib/menu-data";
import { pick } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";
import { useOrder } from "./OrderProvider";
import { OrderStepper } from "./OrderStepper";

const ITEM_INDEX: Map<string, MenuItem> = (() => {
  const m = new Map<string, MenuItem>();
  for (const c of menu) for (const i of c.items) m.set(i.id, i);
  return m;
})();

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

export function OrderSheet() {
  const { lang, t } = useLang();
  const { order, count, open, setOpen, increment, decrement, clear } =
    useOrder();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);

    const id = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, setOpen]);

  const entries = useMemo(() => {
    const out: { id: string; qty: number; item: MenuItem }[] = [];
    for (const [id, qty] of Object.entries(order)) {
      const item = ITEM_INDEX.get(id);
      if (item) out.push({ id, qty, item });
    }
    return out;
  }, [order]);

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + e.qty * e.item.price, 0),
    [entries]
  );

  const formatPrice = (n: number) => {
    const locale = lang === "ar" ? "ar-DZ" : "fr-FR";
    return new Intl.NumberFormat(locale).format(n) + " DA";
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      role="presentation"
    >
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 animate-fade-in bg-app/55 backdrop-blur-[3px]"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-sheet-title"
        className="relative z-[81] flex max-h-[88vh] w-full max-w-xl animate-sheet-up flex-col overflow-hidden rounded-t-2xl bg-surface-overlay shadow-modal ring-1 ring-line-soft"
      >
        <div className="flex justify-center pb-1 pt-2.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>

        <header className="flex items-center justify-between gap-3 px-5 pb-3">
          <h2
            id="order-sheet-title"
            className="font-display text-[26px] leading-none text-fg"
          >
            {t("orderTitle")}
          </h2>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-[12px] text-muted underline decoration-line underline-offset-2 transition hover:text-fg"
              >
                {t("orderClear")}
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("orderClose")}
              className="grid h-9 w-9 touch-manipulation place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-fg"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        {entries.length === 0 ? (
          <div className="px-6 pb-10 pt-6 text-center">
            <p className="font-display text-xl text-fg">{t("orderEmpty")}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {t("orderEmptyHint")}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line-soft overflow-y-auto px-5">
              {entries.map(({ id, qty, item }) => {
                const name = pick(item.name, lang);
                const lineTotal = formatPrice(item.price * qty);
                const unit = formatPrice(item.price);
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 py-3"
                  >
                    {item.image ? (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        aria-hidden="true"
                        className="h-14 w-14 flex-shrink-0 rounded-lg bg-surface-2"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-fg">
                        {name}
                      </p>
                      <p
                        className="mt-0.5 text-[12.5px] tabular-nums text-muted"
                        dir="ltr"
                      >
                        {qty > 1 ? (
                          <>
                            <span className="text-fg">{lineTotal}</span>
                            <span className="ms-1.5 text-subtle">
                              · {unit} × {qty}
                            </span>
                          </>
                        ) : (
                          unit
                        )}
                      </p>
                    </div>
                    <OrderStepper
                      quantity={qty}
                      onIncrement={() => increment(id)}
                      onDecrement={() => decrement(id)}
                      size="sm"
                    />
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-line-soft bg-surface px-5 pb-5 pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[11px] uppercase tracking-widest text-accent-strong">
                  {t("orderTotal")}
                </p>
                <p
                  className="font-display text-[28px] font-semibold tabular-nums text-fg"
                  dir="ltr"
                >
                  {formatPrice(total)}
                </p>
              </div>
              <p className="mt-3 rounded-lg border border-line-soft bg-app/60 px-3 py-2 text-center text-[12.5px] leading-relaxed text-muted">
                {t("orderShowWaiter")}
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
