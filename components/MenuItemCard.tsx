"use client";

import Image from "next/image";
import { useState } from "react";
import type { MenuItem } from "@/lib/menu-data";
import { pick } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

type Props = {
  item: MenuItem;
};

const formatPrice = (n: number, lang: string) => {
  const locale = lang === "ar" ? "ar-DZ" : "fr-FR";
  return new Intl.NumberFormat(locale).format(n) + " DA";
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
  const price = formatPrice(item.price, lang);
  const alt = description
    ? `${name} — ${description}`
    : t("photoOf", { name });

  return (
    <article className="relative overflow-hidden rounded-xl border border-line-soft bg-surface shadow-card">
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
            className={`object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-sans text-[16px] font-semibold leading-snug text-fg">
            {name}
          </h3>
          <span
            aria-label={`${t("pricePrefix")}${price}`}
            className="flex-shrink-0 font-sans text-[15px] font-semibold tabular-nums tracking-tight text-fg"
            dir="ltr"
          >
            {price}
          </span>
        </div>
        {description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}
