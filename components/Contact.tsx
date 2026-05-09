"use client";

import { restaurant } from "@/lib/restaurant";
import { useT } from "./LanguageProvider";

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 12a8 8 0 1 1-3.4-6.5L20 4l-1.5 3.4A8 8 0 0 1 20 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1-2-1-1 .5C11 13 11 11 11 11l.5-1-1-2-1 1Z"
      fill="currentColor"
    />
  </svg>
);

const MapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v8h3v-8h2.5L17 10h-3V8.5c0-.3.2-.5.5-.5H14Z"
      fill="currentColor"
    />
  </svg>
);

export function Contact() {
  const t = useT();

  const links = [
    {
      key: "contactCall" as const,
      href: `tel:${restaurant.phone}`,
      Icon: PhoneIcon,
      external: false,
    },
    {
      key: "contactWhatsapp" as const,
      href: `https://wa.me/${restaurant.whatsapp}`,
      Icon: WhatsAppIcon,
      external: true,
    },
    {
      key: "contactMaps" as const,
      href: restaurant.mapsUrl,
      Icon: MapIcon,
      external: true,
    },
    {
      key: "contactInstagram" as const,
      href: restaurant.instagram,
      Icon: InstagramIcon,
      external: true,
    },
    {
      key: "contactFacebook" as const,
      href: restaurant.facebook,
      Icon: FacebookIcon,
      external: true,
    },
  ];

  const year = new Date().getFullYear();

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-sand-200 bg-sand-50"
    >
      <div className="mx-auto max-w-xl px-6 py-9 text-center">
        <h2
          id="contact-heading"
          className="text-[10px] uppercase tracking-widest text-gold-deep"
        >
          {t("contactLabel")}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700/75">
          {t("contactHours", { hours: restaurant.hours })}
        </p>

        <ul className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {links.map(({ key, href, Icon, external }) => (
            <li key={key}>
              <a
                href={href}
                aria-label={t(key)}
                {...(external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="grid h-11 w-11 place-items-center rounded-full border border-sand-200 bg-white text-ink-700 transition hover:border-gold/50 hover:text-ink"
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[12.5px] tabular-nums text-ink-700/70" dir="ltr">
          {restaurant.phoneDisplay}
          <span aria-hidden="true" className="mx-2 text-gold/40">
            ·
          </span>
          {t("location")}
        </p>

        <p className="mt-6 text-[11px] text-ink-700/45">
          {t("contactCopyright", { year })}
        </p>
      </div>
    </section>
  );
}
