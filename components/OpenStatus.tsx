"use client";

import { useEffect, useState } from "react";
import { useT } from "./LanguageProvider";

const OPEN_HOUR = 9;
const CLOSE_HOUR = 22;

type Status = {
  open: boolean;
  key: "statusOpen" | "statusClosedToday" | "statusClosedTomorrow";
  hour: number;
};

function compute(now: Date): Status {
  const h = now.getHours();
  const m = now.getMinutes();
  const minutes = h * 60 + m;
  const openMin = OPEN_HOUR * 60;
  const closeMin = CLOSE_HOUR * 60;

  if (minutes >= openMin && minutes < closeMin) {
    return { open: true, key: "statusOpen", hour: CLOSE_HOUR };
  }
  if (minutes < openMin) {
    return { open: false, key: "statusClosedToday", hour: OPEN_HOUR };
  }
  return { open: false, key: "statusClosedTomorrow", hour: OPEN_HOUR };
}

export function OpenStatus() {
  const t = useT();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    setStatus(compute(new Date()));
    const id = setInterval(() => setStatus(compute(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!status) {
    return (
      <div
        aria-hidden="true"
        className="inline-flex h-7 w-44 animate-pulse rounded-full bg-ink-800/60"
      />
    );
  }

  const label = t(status.key, { h: status.hour });

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium tracking-wide ${
        status.open
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/30 bg-rose-400/10 text-rose-200"
      }`}
    >
      <span
        aria-hidden="true"
        className="relative grid h-2 w-2 place-items-center"
      >
        <span
          className={`absolute inset-0 rounded-full ${
            status.open ? "bg-emerald-400 animate-ping" : "bg-rose-400/60"
          }`}
        />
        <span
          className={`relative h-2 w-2 rounded-full ${
            status.open ? "bg-emerald-300" : "bg-rose-300"
          }`}
        />
      </span>
      {label}
    </div>
  );
}
