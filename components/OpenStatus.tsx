"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LanguageProvider";
import { restaurant } from "@/lib/restaurant";
import type { Lang } from "@/lib/i18n";

type Status = {
  open: boolean;
  key: "statusOpen" | "statusClosedToday" | "statusClosedTomorrow";
  hour: number;
  minute: number;
};

function compute(now: Date): Status {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openMin = restaurant.openHour * 60 + restaurant.openMinute;
  const closeMin = restaurant.closeHour * 60 + restaurant.closeMinute;

  if (minutes >= openMin && minutes < closeMin) {
    return {
      open: true,
      key: "statusOpen",
      hour: restaurant.closeHour,
      minute: restaurant.closeMinute,
    };
  }
  if (minutes < openMin) {
    return {
      open: false,
      key: "statusClosedToday",
      hour: restaurant.openHour,
      minute: restaurant.openMinute,
    };
  }
  return {
    open: false,
    key: "statusClosedTomorrow",
    hour: restaurant.openHour,
    minute: restaurant.openMinute,
  };
}

/** Locale-aware compact time format. French uses the "11h30" convention;
 * English and Arabic use 24-hour "11:30". */
function fmtTime(h: number, m: number, lang: Lang): string {
  const mm = String(m).padStart(2, "0");
  if (lang === "fr") return `${h}h${mm}`;
  return `${h}:${mm}`;
}

export function OpenStatus() {
  const { t, lang } = useLang();
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

  const label = t(status.key, { time: fmtTime(status.hour, status.minute, lang) });

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium tracking-wide ${
        status.open
          ? "border-status-open/40 bg-status-open/10 text-status-open-fg"
          : "border-status-closed/25 bg-transparent text-status-closed-fg"
      }`}
    >
      <span
        aria-hidden="true"
        className="relative grid h-2 w-2 place-items-center"
      >
        {/* Open: a live gold dot that breathes via the ping ring.
         * Closed: a quiet hollow taupe ring, static — no alarm color. */}
        {status.open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-status-open" />
        )}
        <span
          className={`relative h-2 w-2 rounded-full ${
            status.open
              ? "bg-status-open"
              : "border border-status-closed/80 bg-transparent"
          }`}
        />
      </span>
      {label}
    </div>
  );
}
