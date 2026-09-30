"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { CategoryWithDishes } from "@/lib/admin/queries";
import type { DishRow } from "@/lib/supabase/types";
import { deaccent, formatPrice } from "@/lib/admin/format";
import {
  deleteDish,
  moveDish,
  setDishAvailability,
  updateDishPrice,
} from "@/lib/admin/dish-actions";
import { DishThumb } from "./DishThumb";
import { Badge, Kbd } from "./ui/Badge";
import { Button, buttonClass, iconButtonClass } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { EmptyState } from "./ui/EmptyState";
import { controlClass } from "./ui/Field";
import { isModalOpen, isTypingTarget } from "./ui/keyboard";
import { PageHeader } from "./ui/PageHeader";
import { Segmented } from "./ui/Segmented";
import { Sheet, SheetItem } from "./ui/Sheet";
import { Toggle } from "./ui/Switch";
import { useToast } from "./ui/Toast";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  MoreIcon,
  PencilIcon,
  PlusIcon,
  ReorderIcon,
  SearchIcon,
  TrashIcon,
} from "./icons";

export type DishFilter = "all" | "hidden" | "no-photo";

export const DISH_FILTERS: DishFilter[] = ["all", "hidden", "no-photo"];

const FILTER_LABELS: Record<DishFilter, string> = {
  all: "Tous",
  hidden: "Masqués",
  "no-photo": "Sans photo",
};

/** Drops overrides the server has caught up with (or whose dish is gone),
 * so an optimistic value never shadows a later change from another device. */
function settle<T>(
  prev: Record<string, T>,
  serverValue: (id: string) => T | undefined
): Record<string, T> {
  let changed = false;
  const next = { ...prev };
  for (const id of Object.keys(prev)) {
    const value = serverValue(id);
    if (value === undefined || value === prev[id]) {
      delete next[id];
      changed = true;
    }
  }
  return changed ? next : prev;
}

function omit<T>(record: Record<string, T>, key: string) {
  const { [key]: _, ...rest } = record;
  return rest;
}

/** Wraps the matched part of `text` in <mark>, accent-insensitively. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = deaccent(query.trim());
  if (!q) return <>{text}</>;
  const haystack = deaccent(text);
  // Indices only line up when stripping accents kept the length — true for
  // French in NFC, which is what the inputs produce.
  if (haystack.length !== text.length) return <>{text}</>;

  const parts: ReactNode[] = [];
  let from = 0;
  let at = haystack.indexOf(q);
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at}>{text.slice(at, at + q.length)}</mark>);
    from = at + q.length;
    at = haystack.indexOf(q, from);
  }
  parts.push(text.slice(from));
  return <>{parts}</>;
}

// ---------------------------------------------------------------------------

/**
 * Tap the price to retype it in place — the most frequent edit a restaurant
 * makes, without opening the full form. Enter or leaving the field saves,
 * Escape cancels.
 */
function PriceEditor({
  name,
  price,
  onSave,
  className = "",
}: {
  name: string;
  price: number;
  onSave: (price: number) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  /** Enter/Escape unmount the input, which then fires blur — this stops
   * that blur from saving a second time (or saving after a cancel). */
  const settled = useRef(false);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function start() {
    settled.current = false;
    setDraft(String(price));
    setEditing(true);
  }

  function finish(commit: boolean) {
    if (settled.current) return;
    settled.current = true;
    setEditing(false);
    if (!commit || draft === "") return;
    const next = Number(draft);
    if (Number.isInteger(next) && next !== price) onSave(next);
  }

  if (editing) {
    return (
      <span className={`relative inline-flex items-center ${className}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`Nouveau prix de ${name}, en dinars`}
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.replace(/[^\d]/g, "").slice(0, 7))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              finish(true);
            } else if (e.key === "Escape") {
              e.preventDefault();
              finish(false);
            }
          }}
          onBlur={() => finish(true)}
          className="h-9 w-[112px] rounded-lg border border-accent bg-surface pe-9 ps-2.5 text-end text-[16px] font-semibold tabular-nums text-fg ring-4 ring-accent/15 focus:outline-none md:text-[14px]"
        />
        <span className="pointer-events-none absolute end-2.5 text-[10.5px] font-semibold text-subtle">
          DA
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      title="Modifier le prix"
      aria-label={`Prix de ${name} : ${formatPrice(price)} dinars. Modifier`}
      className={`group/price inline-flex h-9 touch-manipulation items-center gap-1 rounded-lg px-2 transition-colors hover:bg-surface-2 ${className}`}
    >
      <span className="text-[15px] font-semibold tabular-nums text-fg md:text-[14px]">
        {formatPrice(price)}
      </span>
      <span className="text-[10.5px] font-semibold text-subtle">DA</span>
      <PencilIcon className="ms-0.5 h-3.5 w-3.5 text-subtle opacity-60 transition-opacity group-hover/price:opacity-100 md:opacity-0" />
    </button>
  );
}

// ---------------------------------------------------------------------------

type Props = {
  categories: CategoryWithDishes[];
  initialFilter: DishFilter;
  /** Section to scroll to on arrival — the dashboard's "Par catégorie" links. */
  initialCategory: string | null;
  /** Header subtitle, e.g. "37 plats · 6 catégories". */
  summary: string;
};

/** Where a section counts as "current" for the category bar: just under
 * the sticky bars (phone top bar + category bar, or the category bar alone
 * on desktop). Kept a little below the scroll-margin used when jumping, so
 * a section you jumped to is the one highlighted. */
const spyLine = () =>
  window.matchMedia("(min-width: 768px)").matches ? 96 : 140;

export function DishList({
  categories,
  initialFilter,
  initialCategory,
  summary,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const chipBarRef = useRef<HTMLDivElement>(null);

  /** The dish whose ⋯ action sheet is open, and the one waiting on a
   * delete confirmation. */
  const [actionsFor, setActionsFor] = useState<DishRow | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<DishRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DishFilter>(initialFilter);
  const [reordering, setReordering] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Optimistic state: edits render instantly and the server catches up
  // behind them. Each map is keyed by dish id (or category id for order).
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<Record<string, string[]>>({});
  /** Deleted here, still in the props until the refreshed list arrives. */
  const [removed, setRemoved] = useState<Record<string, true>>({});
  /** Arrow taps queue up faster than the server answers. While any are in
   * flight the local order is ahead of the props, so props must not reset
   * it — only once the last one lands. */
  const movesInFlight = useRef(0);

  const byId = useMemo(
    () =>
      new Map(categories.flatMap((c) => c.dishes.map((d) => [d.id, d] as const))),
    [categories]
  );

  useEffect(() => {
    setAvailability((prev) => settle(prev, (id) => byId.get(id)?.is_available));
    setPrices((prev) => settle(prev, (id) => byId.get(id)?.price));
    if (movesInFlight.current === 0) setOrder({});
    setRemoved((prev) => {
      const still = Object.keys(prev).filter((id) => byId.has(id));
      return still.length === Object.keys(prev).length
        ? prev
        : Object.fromEntries(still.map((id) => [id, true as const]));
    });
  }, [byId]);

  // Keep the filter in the URL, so a refresh — or the dashboard's "3 plats
  // sans photo" link — lands on the same view. replaceState, not the
  // router: changing a filter must not refetch the page. `category` is a
  // one-shot jump target, consumed on arrival.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);
    params.delete("category");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname
    );
  }, [filter]);

  // "/" jumps to search, as in most web apps.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || isTypingTarget(e.target) || isModalOpen()) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isVisible = (dish: DishRow) => availability[dish.id] ?? dish.is_available;
  const priceOf = (dish: DishRow) => prices[dish.id] ?? dish.price;

  const ordered = useMemo(
    () =>
      categories.map((category) => {
        const ids = order[category.id];
        if (!ids) return category;
        const dishes = ids
          .map((id) => byId.get(id))
          .filter((d): d is DishRow => Boolean(d));
        // A dish added or removed elsewhere makes the override stale.
        return dishes.length === category.dishes.length
          ? { ...category, dishes }
          : category;
      }),
    [categories, order, byId]
  );

  const listed = ordered.map((category) => ({
    ...category,
    dishes: category.dishes.filter((d) => !removed[d.id]),
  }));

  const allDishes = listed.flatMap((c) => c.dishes);
  const counts: Record<DishFilter, number> = {
    all: allDishes.length,
    hidden: allDishes.filter((d) => !isVisible(d)).length,
    "no-photo": allDishes.filter((d) => !d.image_url).length,
  };

  const q = deaccent(query.trim());
  const groups = listed
    .map((category) => ({
      category,
      dishes: reordering
        ? category.dishes // reordering a filtered list would swap with invisible neighbours
        : category.dishes.filter((dish) => {
            if (filter === "hidden" && isVisible(dish)) return false;
            if (filter === "no-photo" && dish.image_url) return false;
            if (!q) return true;
            return (
              deaccent(dish.name_fr).includes(q) ||
              deaccent(category.title_fr).includes(q)
            );
          }),
    }))
    .filter((group) => group.dishes.length > 0 || reordering);

  const shown = groups.reduce((n, g) => n + g.dishes.length, 0);
  const filtersActive = Boolean(q) || filter !== "all";
  const sectionKey = groups.map((g) => g.category.id).join(",");

  // ---- category bar ---------------------------------------------------------

  function jumpTo(id: string, smooth = true) {
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }

  useEffect(() => {
    if (!initialCategory) return;
    const raf = requestAnimationFrame(() => jumpTo(initialCategory, false));
    return () => cancelAnimationFrame(raf);
  }, [initialCategory]);

  // Scroll-spy: highlight the chip of the section under the sticky bars.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sections = [
        ...document.querySelectorAll<HTMLElement>("[data-dish-section]"),
      ];
      if (sections.length === 0) {
        setActiveSection(null);
        return;
      }
      const line = spyLine();
      let current = sections[0].dataset.dishSection ?? null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top > line) break;
        current = section.dataset.dishSection ?? current;
      }
      // At the very bottom a short last section can't reach the line.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        current = sections[sections.length - 1].dataset.dishSection ?? current;
      }
      setActiveSection(current);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionKey]);

  // Keep the highlighted chip in view as the list scrolls past sections.
  useEffect(() => {
    const bar = chipBarRef.current;
    const chip = activeSection
      ? bar?.querySelector<HTMLElement>(`[data-chip="${activeSection}"]`)
      : null;
    if (!bar || !chip) return;
    const barRect = bar.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    bar.scrollBy({
      left: chipRect.left - barRect.left - (barRect.width - chipRect.width) / 2,
      behavior: "smooth",
    });
  }, [activeSection]);

  // ---- actions ------------------------------------------------------------

  function toggleVisibility(dish: DishRow, next: boolean, announce = true) {
    setAvailability((prev) => ({ ...prev, [dish.id]: next }));
    startTransition(async () => {
      const result = await setDishAvailability(dish.id, next);
      if (!result.ok) {
        setAvailability((prev) => omit(prev, dish.id));
        toast.error(result.message ?? "La modification a échoué.");
        return;
      }
      if (!announce) return;
      toast.success(
        next
          ? `« ${dish.name_fr} » est de nouveau visible.`
          : `« ${dish.name_fr} » est masqué de la carte.`,
        {
          action: {
            label: "Annuler",
            onClick: () => toggleVisibility(dish, !next, false),
          },
        }
      );
    });
  }

  function savePrice(dish: DishRow, next: number, announce = true) {
    const previous = priceOf(dish);
    setPrices((prev) => ({ ...prev, [dish.id]: next }));
    startTransition(async () => {
      const result = await updateDishPrice(dish.id, next);
      if (!result.ok) {
        setPrices((prev) => omit(prev, dish.id));
        toast.error(result.message ?? "La modification a échoué.");
        return;
      }
      if (!announce) return;
      toast.success(`« ${dish.name_fr} » : ${formatPrice(next)} DA.`, {
        action: {
          label: "Annuler",
          onClick: () => savePrice(dish, previous, false),
        },
      });
    });
  }

  function move(
    category: CategoryWithDishes,
    dish: DishRow,
    direction: "up" | "down"
  ) {
    const ids = category.dishes.map((d) => d.id);
    const from = ids.indexOf(dish.id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    setOrder((prev) => ({ ...prev, [category.id]: ids }));

    movesInFlight.current += 1;
    startTransition(async () => {
      const result = await moveDish(dish.id, direction);
      movesInFlight.current -= 1;
      if (!result.ok) {
        setOrder({});
        toast.error(result.message ?? "Le déplacement a échoué.");
      }
    });
  }

  function removeDish(dish: DishRow) {
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteDish(dish.id);
      setDeleting(false);
      setConfirmingDelete(null);
      if (!result.ok) {
        toast.error(result.message ?? "La suppression a échoué.");
        return;
      }
      setRemoved((prev) => ({ ...prev, [dish.id]: true }));
      toast.success(`« ${dish.name_fr} » a été supprimé.`);
    });
  }

  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  // ---- render -------------------------------------------------------------

  return (
    <div>
      <PageHeader
        title="Plats"
        subtitle={summary}
        action={
          <>
            <Button
              variant={reordering ? "primary" : "secondary"}
              onClick={() => setReordering((v) => !v)}
              aria-pressed={reordering}
              icon={
                reordering ? (
                  <CheckIcon className="h-[18px] w-[18px]" />
                ) : (
                  <ReorderIcon className="h-[18px] w-[18px]" />
                )
              }
            >
              {reordering ? "Terminé" : "Réorganiser"}
            </Button>
            <Link
              href="/admin/dishes/new"
              className={buttonClass("primary", "md", "hidden md:inline-flex")}
            >
              <PlusIcon className="h-[18px] w-[18px]" />
              Nouveau plat
            </Link>
          </>
        }
      />

      {/* ---- search + filter ---- */}
      {reordering ? (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft/60 px-4 py-3.5 text-[14px] leading-snug text-fg md:text-[13px]">
          <InfoIcon className="mt-px h-[18px] w-[18px] flex-shrink-0 text-accent-strong" />
          <p>
            Changez l&apos;ordre avec les flèches. C&apos;est l&apos;ordre de
            la carte, enregistré à chaque déplacement.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 md:flex-1">
            <SearchIcon className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-[18px] w-[18px] text-subtle" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.preventDefault();
                  setQuery("");
                }
              }}
              placeholder="Rechercher un plat"
              aria-label="Rechercher un plat"
              // iPhone keyboard: a "Rechercher" key, and no autocorrect
              // "fixing" dish names like Chorba or Mhajeb.
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className={`${controlClass()} h-11 pe-11 ps-10`}
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                aria-label="Effacer la recherche"
                className="absolute end-1 top-1 grid h-9 w-9 touch-manipulation place-items-center rounded-lg"
              >
                <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-subtle/25 text-fg">
                  <CloseIcon className="h-3 w-3" />
                </span>
              </button>
            ) : (
              <Kbd className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2">
                /
              </Kbd>
            )}
          </div>

          <Segmented
            label="Filtrer les plats"
            fullWidth="mobile"
            value={filter}
            onChange={setFilter}
            options={DISH_FILTERS.map((value) => ({
              value,
              label: FILTER_LABELS[value],
              count: counts[value],
            }))}
          />
        </div>
      )}

      {filtersActive && !reordering && shown > 0 && (
        <div
          aria-live="polite"
          className="mt-3 flex items-center justify-between gap-3 ps-1 text-[14px] md:text-[13px]"
        >
          <span className="text-muted">
            {shown} résultat{shown > 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="h-9 touch-manipulation rounded-lg px-2 font-medium text-accent-strong"
          >
            Tout afficher
          </button>
        </div>
      )}

      {/* ---- category bar: jump to a section; follows the scroll ---- */}
      {groups.length > 1 && (
        <nav
          aria-label="Aller à une catégorie"
          // Sticks under the phone top bar (h-14); no bar on desktop. The
          // negative margins take it edge to edge through the page padding.
          className="sticky top-14 z-20 -mx-4 mt-4 border-b border-line-soft bg-app/90 backdrop-blur-md sm:-mx-6 md:top-0 md:-mx-8 lg:-mx-10"
        >
          <div
            ref={chipBarRef}
            className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar sm:px-6 md:px-8 lg:px-10"
          >
            {groups.map(({ category, dishes }) => {
              const active = activeSection === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  data-chip={category.id}
                  onClick={() => jumpTo(category.id)}
                  aria-current={active ? "true" : undefined}
                  className={`inline-flex h-9 flex-shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[14px] font-medium transition-colors md:h-8 md:text-[13px] ${
                    active
                      ? "bg-fg text-app"
                      : "bg-surface text-muted ring-1 ring-inset ring-line-soft hover:text-fg"
                  }`}
                >
                  {category.title_fr}
                  <span className="text-[12px] tabular-nums opacity-60">
                    {dishes.length}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ---- grouped list ---- */}
      {shown === 0 && !reordering ? (
        <div className="mt-5">
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="Aucun plat trouvé"
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Tout afficher
              </Button>
            }
          >
            {q
              ? `Aucun plat ne correspond à « ${query.trim()} ».`
              : "Aucun plat ne correspond à ce filtre."}
          </EmptyState>
        </div>
      ) : (
        groups.map(({ category, dishes }) => (
          <section
            key={category.id}
            id={`section-${category.id}`}
            data-dish-section={category.id}
            aria-labelledby={`cat-${category.id}`}
            // Clears the sticky bars when jumped to (see spyLine).
            className="mt-6 scroll-mt-[124px] md:scroll-mt-[76px]"
          >
            <div className="mb-2.5 flex items-center justify-between gap-3 ps-1">
              <h2
                id={`cat-${category.id}`}
                className="min-w-0 truncate text-[17px] font-semibold tracking-tight text-fg md:text-[15px]"
              >
                {category.title_fr}
                <span className="ms-2 text-[13px] font-medium tabular-nums text-subtle">
                  {dishes.length}
                </span>
              </h2>
              {!reordering && (
                <Link
                  href={`/admin/dishes/new?category=${category.id}`}
                  aria-label={`Ajouter un plat dans ${category.title_fr}`}
                  className="-me-1 inline-flex h-9 flex-shrink-0 touch-manipulation items-center gap-1 rounded-lg px-2.5 text-[14px] font-medium text-accent-strong transition-colors hover:bg-accent-soft/60 md:h-8 md:text-[13px]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Ajouter
                </Link>
              )}
            </div>

            {dishes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-[13px] text-subtle">
                Aucun plat dans cette catégorie.
              </p>
            ) : (
              <ul className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-admin-xs">
                {dishes.map((dish, index) =>
                  reordering ? (
                    <li
                      key={dish.id}
                      className="flex items-center gap-3 py-2 pe-2 ps-3 sm:ps-4"
                    >
                      <span className="w-5 flex-shrink-0 text-center text-[12px] tabular-nums text-subtle">
                        {index + 1}
                      </span>
                      <DishThumb
                        src={dish.image_url}
                        size="sm"
                        dimmed={!isVisible(dish)}
                      />
                      <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-fg md:text-[14px]">
                        {dish.name_fr}
                      </p>
                      <button
                        type="button"
                        onClick={() => move(category, dish, "up")}
                        disabled={index === 0}
                        aria-label={`Monter ${dish.name_fr}`}
                        className={iconButtonClass("md", "!h-11 !w-11 md:!h-10 md:!w-10")}
                      >
                        <ArrowUpIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(category, dish, "down")}
                        disabled={index === dishes.length - 1}
                        aria-label={`Descendre ${dish.name_fr}`}
                        className={iconButtonClass("md", "!h-11 !w-11 md:!h-10 md:!w-10")}
                      >
                        <ArrowDownIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ) : (
                    <DishRowItem
                      key={dish.id}
                      dish={dish}
                      query={query}
                      visible={isVisible(dish)}
                      price={priceOf(dish)}
                      onToggle={(next) => toggleVisibility(dish, next)}
                      onPrice={(next) => savePrice(dish, next)}
                      onMore={() => setActionsFor(dish)}
                    />
                  )
                )}
              </ul>
            )}
          </section>
        ))
      )}

      {/* ---- per-dish actions (the ⋯ button) ---- */}
      <Sheet
        open={actionsFor !== null}
        onClose={() => setActionsFor(null)}
        title={actionsFor?.name_fr ?? ""}
        description={
          actionsFor
            ? `${formatPrice(priceOf(actionsFor))} DA · ${
                categories.find((c) => c.id === actionsFor.category_id)
                  ?.title_fr ?? ""
              }`
            : undefined
        }
      >
        {actionsFor && (
          <div className="space-y-1">
            <SheetItem
              icon={<PencilIcon className="h-5 w-5" />}
              label="Modifier le plat"
              description="Nom, prix, photo, description, catégorie."
              onClick={() => {
                const id = actionsFor.id;
                setActionsFor(null);
                router.push(`/admin/dishes/${id}`);
              }}
            />
            {isVisible(actionsFor) ? (
              <SheetItem
                icon={<EyeOffIcon className="h-5 w-5" />}
                label="Masquer de la carte"
                description="Pour un plat épuisé — vous pourrez le réafficher."
                onClick={() => {
                  toggleVisibility(actionsFor, false);
                  setActionsFor(null);
                }}
              />
            ) : (
              <SheetItem
                icon={<EyeIcon className="h-5 w-5" />}
                label="Afficher sur la carte"
                description="Le plat redevient visible pour les clients."
                onClick={() => {
                  toggleVisibility(actionsFor, true);
                  setActionsFor(null);
                }}
              />
            )}
            <SheetItem
              icon={<TrashIcon className="h-5 w-5" />}
              label="Supprimer le plat"
              description="Définitif, avec sa photo."
              tone="danger"
              onClick={() => {
                setConfirmingDelete(actionsFor);
                setActionsFor(null);
              }}
            />
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmingDelete !== null}
        title="Supprimer ce plat ?"
        message={`« ${confirmingDelete?.name_fr ?? ""} » disparaîtra définitivement de la carte, avec sa photo. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleting}
        onConfirm={() => confirmingDelete && removeDish(confirmingDelete)}
        onCancel={() => setConfirmingDelete(null)}
      />
    </div>
  );
}

function DishRowItem({
  dish,
  query,
  visible,
  price,
  onToggle,
  onPrice,
  onMore,
}: {
  dish: DishRow;
  query: string;
  visible: boolean;
  price: number;
  onToggle: (next: boolean) => void;
  onPrice: (next: number) => void;
  onMore: () => void;
}) {
  return (
    <li className="relative flex items-center gap-3 py-2.5 pe-1 ps-3 transition-colors hover:bg-surface-2/50 sm:gap-4 sm:pe-2 sm:ps-4">
      {/* The whole row opens the dish. The link is a layer over the photo
       * and text — z-[1], because the photo is itself positioned and would
       * otherwise sit on top and swallow the tap — and under the price,
       * switch and ⋯ (z-10). Not their parent: interactive elements inside
       * an <a> are invalid and swallow the tap on iOS. */}
      <Link
        href={`/admin/dishes/${dish.id}`}
        aria-label={`Modifier ${dish.name_fr}`}
        className="absolute inset-0 z-[1] focus-visible:outline-offset-[-2px]"
      />

      <DishThumb src={dish.image_url} dimmed={!visible} />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={`truncate text-[16px] font-medium leading-snug md:text-[14.5px] ${
              visible ? "text-fg" : "text-subtle"
            }`}
          >
            <Highlight text={dish.name_fr} query={query} />
          </p>
          {!visible && (
            <Badge dot className="hidden sm:inline-flex">
              Masqué
            </Badge>
          )}
        </div>
        <p className="mt-0.5 hidden truncate text-[12.5px] text-subtle sm:block">
          {dish.description_fr || "Sans description"}
        </p>
        <div className="relative z-10 mt-0.5 flex items-center gap-2 sm:hidden">
          <PriceEditor
            name={dish.name_fr}
            price={price}
            onSave={onPrice}
            className="-ms-2"
          />
          {!visible && (
            <span className="text-[13px] font-medium text-subtle">· Masqué</span>
          )}
        </div>
      </div>

      <div className="relative z-10 hidden sm:block">
        <PriceEditor name={dish.name_fr} price={price} onSave={onPrice} />
      </div>

      <div className="relative z-10 flex items-center">
        {/* Full iOS-size switch: this is the one control tapped mid-service. */}
        <Toggle
          checked={visible}
          onChange={onToggle}
          aria-label={`Visible sur la carte : ${dish.name_fr}`}
        />
      </div>

      <button
        type="button"
        onClick={onMore}
        aria-label={`Actions pour ${dish.name_fr} : modifier, masquer, supprimer`}
        aria-haspopup="dialog"
        className={iconButtonClass("md", "relative z-10 !h-11 !w-9 md:!h-10 md:!w-10")}
      >
        <MoreIcon className="h-5 w-5" />
      </button>
    </li>
  );
}
