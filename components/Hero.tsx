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

export function Hero() {
  const t = useT();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-hero-bg text-hero-fg"
    >
      <div className="pointer-events-none absolute inset-0 text-hero-accent">
        <ArchPattern className="h-full w-full" opacity={0.13} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-hero-bg" />

      <div className="absolute end-3 top-3 z-30 flex items-center gap-2">
        <ThemeToggle />
        <LanguagePicker />
      </div>

      <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 pb-6 pt-8 text-center">
        <div
          className="relative h-[72px] w-[72px] animate-pop-in"
          style={{ animationDelay: "0ms" }}
        >
          <div className="absolute inset-0 rounded-full bg-hero-accent/20 blur-2xl" />
          <div className="relative h-full w-full overflow-hidden rounded-full border border-hero-accent/40 bg-hero-bg p-2 shadow-[0_18px_50px_-12px_rgb(var(--hero-accent)/0.4)]">
            <Image
              src={restaurant.logoUrl}
              alt={`${restaurant.name}`}
              fill
              priority
              sizes="72px"
              className="rounded-full object-cover"
            />
          </div>
        </div>

        <h1
          id="hero-title"
          className="mt-4 animate-fade-up font-display text-[34px] font-light leading-[1.05] tracking-tight sm:text-[40px]"
          style={{ animationDelay: "100ms" }}
        >
          Dar El Baraka
        </h1>

        <div
          className="mt-3 animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <OpenStatus />
        </div>

        <ul
          className="mt-3 flex animate-fade-up flex-col items-center gap-1 text-[13px] text-hero-fg-muted"
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
              className="grid h-9 w-9 place-items-center rounded-full border border-hero-accent/30 bg-hero-bg/40 text-hero-fg transition hover:border-hero-accent/60 hover:bg-hero-bg/70 hover:text-hero-accent"
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
              className="grid h-9 w-9 place-items-center rounded-full border border-hero-accent/30 bg-hero-bg/40 text-hero-fg transition hover:border-hero-accent/60 hover:bg-hero-bg/70 hover:text-hero-accent"
            >
              <FacebookIcon />
            </a>
          </li>
        </ul>
      </div>

      <div
        className="relative mx-auto h-[2px] max-w-xl bg-gradient-to-r from-transparent via-hero-accent/55 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
