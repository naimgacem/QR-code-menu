"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { CategoryWithDishes } from "@/lib/admin/queries";
import { moveCategory } from "@/lib/admin/category-actions";
import { Badge } from "./ui/Badge";
import { iconButtonClass } from "./ui/Button";
import { useToast } from "./ui/Toast";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  InfoIcon,
  LayersIcon,
} from "./icons";

/** Up to three overlapping dish photos — a category is recognised faster
 * by its food than by its name. */
function PhotoStack({ category }: { category: CategoryWithDishes }) {
  const photos = category.dishes
    .map((d) => d.image_url)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  if (photos.length === 0) {
    return (
      <span
        aria-hidden="true"
        className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-dashed border-line bg-surface-2/60 text-subtle"
      >
        <LayersIcon className="h-5 w-5" />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className="flex w-[76px] flex-shrink-0 items-center">
      {photos.map((src, i) => (
        <span
          key={i}
          className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-2 ring-surface"
          style={{ marginInlineStart: i === 0 ? 0 : -26, zIndex: 3 - i }}
        >
          <Image src={src} alt="" fill sizes="96px" className="object-cover" />
        </span>
      ))}
    </span>
  );
}

export function CategoryList({
  categories,
}: {
  categories: CategoryWithDishes[];
}) {
  const toast = useToast();
  const [, startTransition] = useTransition();

  /** Local order, ahead of the server while arrow taps are in flight. */
  const [order, setOrder] = useState<string[] | null>(null);
  const movesInFlight = useRef(0);

  useEffect(() => {
    if (movesInFlight.current === 0) setOrder(null);
  }, [categories]);

  const ordered = useMemo(() => {
    if (!order || order.length !== categories.length) return categories;
    const byId = new Map(categories.map((c) => [c.id, c]));
    const list = order.map((id) => byId.get(id));
    return list.every(Boolean) ? (list as CategoryWithDishes[]) : categories;
  }, [categories, order]);

  function move(id: string, direction: "up" | "down") {
    const ids = ordered.map((c) => c.id);
    const from = ids.indexOf(id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    setOrder(ids);

    movesInFlight.current += 1;
    startTransition(async () => {
      const result = await moveCategory(id, direction);
      movesInFlight.current -= 1;
      if (!result.ok) {
        setOrder(null);
        toast.error(result.message ?? "Le déplacement a échoué.");
      }
    });
  }

  return (
    <>
      <p className="mb-4 flex items-start gap-2 text-[13px] leading-relaxed text-subtle">
        <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
        L&apos;ordre ci-dessous est celui que voient vos clients, sur la carte
        et dans la barre de navigation.
      </p>

      <ul className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-admin-xs">
        {ordered.map((category, index) => {
          const count = category.dishes.length;
          const hidden = category.dishes.filter((d) => !d.is_available).length;

          return (
            <li
              key={category.id}
              className="relative flex items-center gap-3 py-3 pe-2 ps-3 transition-colors hover:bg-surface-2/50 sm:gap-4 sm:ps-4"
            >
              <Link
                href={`/admin/categories/${category.id}`}
                aria-label={`Modifier ${category.title_fr}`}
                // z-[1]: above the (positioned) photo stack, so tapping the
                // photos opens the category too; below the arrows (z-10).
                className="absolute inset-0 z-[1] focus-visible:outline-offset-[-2px]"
              />

              <span className="hidden w-5 flex-shrink-0 text-center text-[12px] tabular-nums text-subtle sm:block">
                {index + 1}
              </span>
              <PhotoStack category={category} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium leading-snug text-fg">
                  {category.title_fr}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-subtle">
                  <span>
                    {count === 0
                      ? "Aucun plat"
                      : `${count} plat${count > 1 ? "s" : ""}`}
                  </span>
                  {hidden > 0 && (
                    <Badge tone="warning">
                      {hidden} masqué{hidden > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {category.subtitle_fr && (
                    <span className="hidden truncate sm:inline">
                      · {category.subtitle_fr}
                    </span>
                  )}
                </span>
              </span>

              <span className="relative z-10 flex flex-shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => move(category.id, "up")}
                  disabled={index === 0}
                  aria-label={`Monter ${category.title_fr}`}
                  className={iconButtonClass("md")}
                >
                  <ArrowUpIcon className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => move(category.id, "down")}
                  disabled={index === ordered.length - 1}
                  aria-label={`Descendre ${category.title_fr}`}
                  className={iconButtonClass("md")}
                >
                  <ArrowDownIcon className="h-[18px] w-[18px]" />
                </button>
              </span>
              <ChevronRightIcon className="pointer-events-none h-4 w-4 flex-shrink-0 text-subtle" />
            </li>
          );
        })}
      </ul>
    </>
  );
}
