"use client";

import Image from "next/image";
import { useState } from "react";
import type { MenuItem } from "@/lib/menu-data";
import { pick } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";
import { AddToOrderButton } from "./AddToOrderButton";

type Props = {
  item: MenuItem;
};

const formatPrice = (n: number, lang: string) => {
  const locale = lang === "ar" ? "ar-DZ" : "fr-FR";
  return new Intl.NumberFormat(locale).format(n);
};

const clampAspect = (w: number, h: number) => {
  if (!w || !h) return 4 / 3;
  const r = w / h;
  return Math.min(Math.max(r, 0.8), 16 / 9);
};

export function MenuItemCard({ item }: Props) {
  const { lang, t } = useLang();
  const [loaded, setLoaded] = useState(false);

  const knownAspect =
    item.width && item.height ? clampAspect(item.width, item.height) : null;
  const [aspect, setAspect] = useState<number>(knownAspect ?? 4 / 3);

  const name = pick(item.name, lang);
  const description = item.description ? pick(item.description, lang) : undefined;
  const priceNumber = formatPrice(item.price, lang);
  const ariaPrice = `${t("pricePrefix")}${priceNumber} DA`;
  const alt = description
    ? `${name} — ${description}`
    : t("photoOf", { name });

  return (
    <article className="group relative overflow-hidden rounded-xl border border-line-soft bg-surface shadow-card transition-all duration-500 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-card-hover">
      {item.image && (
        <div
          className="relative w-full overflow-hidden bg-surface-2/60"
          style={{ aspectRatio: aspect }}
        >
          {!loaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-2 via-surface-muted to-surface-2"
            />
          )}
          <Image
            src={item.image}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, 580px"
            loading="lazy"
            onLoad={(e) => {
              if (knownAspect == null) {
                const img = e.currentTarget as HTMLImageElement;
                if (img.naturalWidth && img.naturalHeight) {
                  setAspect(clampAspect(img.naturalWidth, img.naturalHeight));
                }
              }
              setLoaded(true);
            }}
            className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.025] ${
              loaded ? "animate-image-reveal opacity-100" : "opacity-0"
            }`}
          />
          {/* very subtle bottom edge glaze for legibility against the next row */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-surface/40"
          />
        </div>
      )}

      <div className="px-4 pt-3.5 pb-4">
        <div className="price-row">
          <h3 className="min-w-0 font-display text-[20px] font-medium leading-[1.15] text-fg">
            {name}
          </h3>
          <span aria-hidden="true" className="leader" />
          <span
            aria-label={ariaPrice}
            className="flex-shrink-0 whitespace-nowrap"
            dir="ltr"
          >
            <span
              aria-hidden="true"
              className="price-display text-[20px] italic leading-none text-accent-strong"
            >
              {priceNumber}
            </span>
            <span
              aria-hidden="true"
              className="ms-1 align-baseline text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/85"
            >
              DA
            </span>
          </span>
        </div>

        {description && (
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        )}

        <div className="mt-3.5 flex justify-end">
          <AddToOrderButton itemId={item.id} itemName={name} />
        </div>
      </div>
    </article>
  );
}
