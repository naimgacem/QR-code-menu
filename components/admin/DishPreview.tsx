"use client";

import { useEffect, useRef } from "react";
import { MenuItemCard } from "@/components/MenuItemCard";
import type { MenuItem } from "@/lib/menu-data";
import { EyeOffIcon } from "./icons";

/**
 * The dish exactly as customers will see it — the real MenuItemCard, in the
 * menu's own palette and fonts (`.menu-tokens`), updating as the owner
 * types. A picture of the menu, not a working copy: it is inert, so its
 * "Ajouter" button can't touch the owner's own order.
 */
export function DishPreview({
  item,
  hidden,
}: {
  item: MenuItem;
  hidden: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // `inert` isn't in React 18's types yet; set it on the DOM node directly.
  useEffect(() => {
    cardRef.current?.setAttribute("inert", "");
  }, []);

  return (
    <div className="relative">
      <div className="menu-tokens rounded-xl bg-app p-3">
        <div
          ref={cardRef}
          aria-hidden="true"
          className={`pointer-events-none select-none transition-opacity ${
            hidden ? "opacity-40" : ""
          }`}
        >
          {/* Keyed on the photo: the card measures its aspect ratio once,
           * on first load. */}
          <MenuItemCard key={item.image ?? "none"} item={item} />
        </div>
      </div>
      {hidden && (
        <div className="absolute inset-0 grid place-items-center p-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-overlay px-3.5 py-1.5 text-[12.5px] font-medium text-fg shadow-admin-md">
            <EyeOffIcon className="h-4 w-4 text-subtle" />
            Masqué — les clients ne le voient pas
          </span>
        </div>
      )}
    </div>
  );
}
