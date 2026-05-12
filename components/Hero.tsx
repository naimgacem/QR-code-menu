"use client";

import Image from "next/image";
import { restaurant } from "@/lib/restaurant";
import { ArchPattern } from "./ArchPattern";
import { OpenStatus } from "./OpenStatus";
import { LanguagePicker } from "./LanguagePicker";
import { ThemeToggle } from "./ThemeToggle";
import { useT } from "./LanguageProvider";

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="4.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v8h3v-8h2.5L17 10h-3V8.5c0-.3.2-.5.5-.5H14Z"
      fill="currentColor"
    />
  </svg>
);

/** Tiny gold dot used inline as a typographic separator. */
const Bullet = () => (
  <span aria-hidden="true" className="mx-2 inline-block h-1 w-1 rounded-full bg-hero-accent/55 align-middle" />
);

export function Hero() {
  const t = useT();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-hero-bg text-hero-fg"
    >
      {/* drifting Moorish-arch pattern, ambient depth */}
      <div className="pointer-events-none absolute inset-0 animate-drift-pattern text-hero-accent">
        <ArchPattern className="h-full w-full" opacity={0.13} />
      </div>

      {/* subtle radial spotlight behind the logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-12 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-hero-accent/15 blur-3xl"
      />

      {/* bottom transition into the menu body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-hero-bg" />

      <div className="absolute end-3 top-3 z-30 flex items-center gap-2">
        <ThemeToggle />
        <LanguagePicker />
      </div>

      <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 pb-8 pt-9 text-center">
        {/* logo with breathing gold halo */}
        <div
          className="relative h-[80px] w-[80px] animate-pop-in"
          style={{ animationDelay: "0ms" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-[-14%] animate-gold-breathe rounded-full bg-hero-accent/25 blur-2xl"
          />
          <div className="relative h-full w-full overflow-hidden rounded-full border border-hero-accent/50 bg-hero-bg p-2 shadow-[0_20px_60px_-14px_rgb(var(--hero-accent)/0.55)]">
            <Image
              src={restaurant.logoUrl}
              alt={`${restaurant.name}`}
              fill
              priority
              sizes="80px"
              className="rounded-full object-cover"
            />
          </div>
        </div>

        {/* eyebrow flourish above the wordmark — pure typography */}
        <div
          className="mt-5 flex animate-fade-up items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-hero-fg-muted"
          style={{ animationDelay: "60ms" }}
        >
          <span
            aria-hidden="true"
            className="block h-px w-7 origin-right animate-hairline-grow bg-gradient-to-l from-hero-accent/70 to-transparent"
          />
          <span>{t("location")}</span>
          <span
            aria-hidden="true"
            className="block h-px w-7 origin-left animate-hairline-grow bg-gradient-to-r from-hero-accent/70 to-transparent"
          />
        </div>

        <h1
          id="hero-title"
          className="mt-2 animate-fade-up font-display text-[40px] font-normal italic leading-[1.02] tracking-tight text-hero-fg sm:text-[48px]"
          style={{ animationDelay: "100ms" }}
        >
          Dar El Baraka
        </h1>

        <p
          className="mt-1 animate-fade-up text-[11px] font-medium uppercase tracking-[0.38em] text-hero-accent"
          style={{ animationDelay: "150ms" }}
        >
          {restaurant.tagline}
        </p>

        <div
          className="mt-4 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <OpenStatus />
        </div>

        <ul
          className="mt-4 flex animate-fade-up flex-wrap items-center justify-center gap-x-1 gap-y-1.5 text-[13px] text-hero-fg-muted"
          style={{ animationDelay: "260ms" }}
        >
          <li>
            <a
              href={restaurant.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm transition hover:text-hero-accent"
            >
              <PinIcon />
              {t("location")}
            </a>
          </li>
          <li aria-hidden="true">
            <Bullet />
          </li>
          <li>
            <a
              href={`tel:${restaurant.phone}`}
              className="inline-flex items-center gap-1.5 rounded-sm transition hover:text-hero-accent"
            >
              <PhoneIcon />
              <span dir="ltr">{restaurant.phoneDisplay}</span>
            </a>
          </li>
        </ul>

        <ul
          className="mt-4 flex animate-fade-up items-center justify-center gap-2.5"
          style={{ animationDelay: "320ms" }}
        >
          <li>
            <a
              href={restaurant.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label={t("contactInstagram")}
              className="grid h-9 w-9 place-items-center rounded-full border border-hero-accent/30 bg-hero-bg/40 text-hero-fg transition hover:scale-[1.04] hover:border-hero-accent/60 hover:bg-hero-bg/70 hover:text-hero-accent"
            >
              <InstagramIcon />
            </a>
          </li>
          <li>
            <a
              href={restaurant.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label={t("contactFacebook")}
              className="grid h-9 w-9 place-items-center rounded-full border border-hero-accent/30 bg-hero-bg/40 text-hero-fg transition hover:scale-[1.04] hover:border-hero-accent/60 hover:bg-hero-bg/70 hover:text-hero-accent"
            >
              <FacebookIcon />
            </a>
          </li>
        </ul>
      </div>

      {/* gold hairline divider that pulses slowly */}
      <div
        className="relative mx-auto h-[2px] max-w-xl animate-shimmer-slide bg-gradient-to-r from-transparent via-hero-accent/65 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
