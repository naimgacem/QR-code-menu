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
        className="inline-flex h-7 w-44 animate-pulse rounded-full bg-hero-fg/15"
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
          ? "border-status-open/35 bg-status-open/12 text-status-open-fg"
          : "border-status-closed/35 bg-status-closed/12 text-status-closed-fg"
      }`}
    >
      <span
        aria-hidden="true"
        className="relative grid h-2 w-2 place-items-center"
      >
        <span
          className={`absolute inset-0 rounded-full ${
            status.open ? "animate-ping bg-status-open" : "bg-status-closed/60"
          }`}
        />
        <span
          className={`relative h-2 w-2 rounded-full ${
            status.open ? "bg-status-open" : "bg-status-closed"
          }`}
        />
      </span>
      {label}
    </div>
  );
}
