"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Order = Record<string, number>; // itemId → quantity (always ≥ 1)

const STORAGE_KEY = "deb-order";

type Ctx = {
  order: Order;
  count: number;
  open: boolean;
  setOpen: (b: boolean) => void;
  add: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  quantityOf: (id: string) => number;
};

const OrderContext = createContext<Ctx | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<Order>({});
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const sanitized: Order = {};
          for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
            if (typeof v === "number" && Number.isFinite(v) && v >= 1) {
              sanitized[k] = Math.floor(v);
            }
          }
          setOrder(sanitized);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist after hydration (so we don't overwrite stored state with `{}` on first paint).
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (Object.keys(order).length === 0) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
      }
    } catch {
      // ignore
    }
  }, [order, hydrated]);

  const add = useCallback((id: string) => {
    setOrder((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const increment = add;

  const decrement = useCallback((id: string) => {
    setOrder((prev) => {
      const cur = prev[id] ?? 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: cur - 1 };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setOrder((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setOrder({});
  }, []);

  const quantityOf = useCallback(
    (id: string) => order[id] ?? 0,
    [order]
  );

  const count = useMemo(
    () => Object.values(order).reduce((a, b) => a + b, 0),
    [order]
  );

  // Close sheet automatically when the order goes from non-empty to empty.
  useEffect(() => {
    if (count === 0) setOpen(false);
  }, [count]);

  const value = useMemo<Ctx>(
    () => ({
      order,
      count,
      open,
      setOpen,
      add,
      increment,
      decrement,
      remove,
      clear,
      quantityOf,
    }),
    [order, count, open, add, increment, decrement, remove, clear, quantityOf]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
