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

/** Past this drag distance (px) OR this downward velocity (px/ms), a
 * release dismisses the sheet. Otherwise it springs back to rest. */
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.55;
const DISMISS_DURATION = 220;
const SPRING_BACK_DURATION = 220;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function OrderSheet() {
  const { lang, t } = useLang();
  const { order, count, open, setOpen, increment, decrement, clear } =
    useOrder();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  /** Live drag state — held in a ref so pointermove doesn't re-render. */
  const dragRef = useRef<{
    startY: number;
    startTime: number;
    pointerId: number;
  } | null>(null);

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
    return new Intl.NumberFormat(locale).format(n);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = {
      startY: e.clientY,
      startTime: Date.now(),
      pointerId: e.pointerId,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (sheetRef.current) {
      sheetRef.current.style.willChange = "transform";
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    if (!sheetRef.current) return;

    const dragDistance = e.clientY - dragRef.current.startY;
    if (dragDistance < 0) return; // only allow downward drag

    // Add damping for smoother feel - sheet moves slower than finger
    const dampedDistance = Math.min(dragDistance * 0.6, dragDistance);

    const elapsed = Date.now() - dragRef.current.startTime;
    const velocity = elapsed > 0 ? dragDistance / elapsed : 0;

    sheetRef.current.style.transform = `translateY(${dampedDistance}px)`;
    sheetRef.current.style.transition = "none";
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    if (!sheetRef.current) return;

    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const dragDistance = e.clientY - dragRef.current.startY;
    const elapsed = Date.now() - dragRef.current.startTime;
    const velocity = elapsed > 0 ? dragDistance / elapsed : 0;

    dragRef.current = null;

    const shouldDismiss =
      dragDistance > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY;

    if (shouldDismiss) {
      // animate to fully off-screen
      sheetRef.current.style.transition = `transform ${DISMISS_DURATION}ms ${EASE}`;
      sheetRef.current.style.transform = "translateY(100vh)";
      setTimeout(() => {
        setOpen(false);
        if (sheetRef.current) {
          sheetRef.current.style.willChange = "auto";
        }
      }, DISMISS_DURATION);
    } else {
      // spring back smoothly
      sheetRef.current.style.transition = `transform ${SPRING_BACK_DURATION}ms ${EASE}`;
      sheetRef.current.style.transform = "translateY(0)";
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.style.willChange = "auto";
        }
      }, SPRING_BACK_DURATION);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      role="presentation"
    >
      {/* dim backdrop — no blur, just a quick opacity fade so it stays cheap */}
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 animate-fade-in bg-app/35"
        aria-hidden="true"
      />

      {/* frosted-glass tray: translucent + light backdrop blur. The slide-up
       * animation here is transform-only so the GPU just composites the
       * layer to a new position — it doesn't recompute the blur per frame. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-sheet-title"
        className="relative z-[81] flex max-h-[88vh] w-full max-w-xl animate-sheet-up flex-col overflow-hidden rounded-t-2xl bg-surface-overlay/40 ring-1 ring-line-soft/35 shadow-modal backdrop-blur-md"
        ref={sheetRef}
      >
        {/* drag zone */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="touch-none select-none"
        >
          {/* drag handle */}
          <div className="flex justify-center pb-1 pt-2.5" aria-hidden="true">
            <span className="h-1 w-10 rounded-full bg-line/65" />
          </div>

          <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-1">
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
                className="grid h-9 w-9 touch-manipulation place-items-center rounded-full bg-surface/65 text-muted ring-1 ring-line-soft/40 transition hover:bg-surface hover:text-fg"
              >
                <CloseIcon />
              </button>
            </div>
          </header>
        </div>

        {entries.length === 0 ? (
          <div className="px-6 pb-10 pt-6 text-center">
            <p className="font-display text-xl text-fg">{t("orderEmpty")}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {t("orderEmptyHint")}
            </p>
          </div>
        ) : (
          <>
            {/* each order line is a solid card floating on the glass */}
            <ul className="flex-1 space-y-2 overflow-y-auto px-4 pb-3 pt-1">
              {entries.map(({ id, qty, item }) => {
                const name = pick(item.name, lang);
                const lineTotal = formatPrice(item.price * qty);
                const unit = formatPrice(item.price);
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3 ring-1 ring-line-soft/60 shadow-[0_2px_10px_-6px_rgb(var(--fg)/0.22)]"
                  >
                    {item.image ? (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line-soft/60">
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
                        className="h-14 w-14 flex-shrink-0 rounded-lg bg-surface-2 ring-1 ring-line-soft/60"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[16px] font-medium leading-tight text-fg">
                        {name}
                      </p>
                      <p
                        className="mt-0.5 flex items-baseline gap-1.5 text-[12.5px] text-muted"
                        dir="ltr"
                      >
                        {qty > 1 ? (
                          <>
                            <span className="price-display italic text-[15px] text-accent-strong">
                              {lineTotal}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/80">
                              DA
                            </span>
                            <span className="ms-1 text-subtle">
                              · {unit}&nbsp;×&nbsp;{qty}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="price-display italic text-[15px] text-accent-strong">
                              {unit}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/80">
                              DA
                            </span>
                          </>
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

            {/* total — its own solid card floating at the bottom */}
            <footer className="px-4 pb-5 pt-1">
              <div className="rounded-2xl bg-surface px-5 py-4 ring-1 ring-line-soft/60 shadow-card">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-accent-strong">
                    {t("orderTotal")}
                  </p>
                  <p
                    className="price-display flex items-baseline gap-1.5 text-[32px] italic leading-none text-accent-strong"
                    dir="ltr"
                  >
                    <span>{formatPrice(total)}</span>
                    <span className="text-[12px] font-semibold uppercase not-italic tracking-[0.2em] text-accent/85">
                      DA
                    </span>
                  </p>
                </div>
                <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
                  {t("orderShowWaiter")}
                </p>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
