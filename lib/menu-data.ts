import fallbackData from "@/data/menu.json";
import type { LocalizedText } from "./i18n";
import { isSupabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/public";
import type { CategoryRow, DishRow } from "./supabase/types";

export type MenuItem = {
  /** The category/dish SLUG, not the database uuid. Used for DOM ids and as
   * the key of the sessionStorage order state, so it must stay stable. */
  id: string;
  name: LocalizedText;
  price: number;
  description?: LocalizedText;
  image?: string;
  /** natural pixel dimensions of `image`, when known — avoids layout shift */
  width?: number;
  height?: number;
};

export type MenuCategory = {
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  items: MenuItem[];
};

type MenuFile = { categories: MenuCategory[] };

/** Last-known-good snapshot committed to the repo. See `getMenu()`. */
const fallbackMenu: MenuCategory[] = (fallbackData as unknown as MenuFile)
  .categories;

// ---------------------------------------------------------------------------
// Row → app-shape mapping
// ---------------------------------------------------------------------------

/** Builds a LocalizedText, or undefined when there is no French copy to show.
 * FR is canonical: `pick()` falls back to it, so a row with only en/ar set
 * would render blank in French — better to omit the field entirely. */
const localized = (
  fr: string | null,
  en: string | null,
  ar: string | null
): LocalizedText | undefined => {
  const base = fr?.trim();
  if (!base) return undefined;
  const out: LocalizedText = { fr: base };
  if (en?.trim()) out.en = en.trim();
  if (ar?.trim()) out.ar = ar.trim();
  return out;
};

const toMenuItem = (row: DishRow): MenuItem => ({
  id: row.slug,
  name: localized(row.name_fr, row.name_en, row.name_ar) ?? { fr: row.name_fr },
  price: row.price,
  description: localized(
    row.description_fr,
    row.description_en,
    row.description_ar
  ),
  image: row.image_url ?? undefined,
  width: row.image_width ?? undefined,
  height: row.image_height ?? undefined,
});

const byPosition = (a: { position: number }, b: { position: number }) =>
  a.position - b.position;

// ---------------------------------------------------------------------------

/**
 * The menu as the customer sees it.
 *
 * Resolution order:
 *   1. Supabase, when configured — the live data the owner edits in /admin.
 *   2. `data/menu.json`, when Supabase is unset OR the query fails.
 *
 * That second branch is deliberate, not just dev convenience: if Supabase is
 * unreachable at build time, a QR scan still returns a complete menu instead
 * of an error page. The snapshot may be stale; a stale menu beats no menu in
 * a restaurant. Re-run `npm run snapshot` to refresh it.
 */
export async function getMenu(): Promise<MenuCategory[]> {
  if (!isSupabaseConfigured) return fallbackMenu;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, dishes(*)");

    if (error) throw new Error(error.message);
    if (!data) return fallbackMenu;

    const categories = (data as (CategoryRow & { dishes: DishRow[] })[])
      .slice()
      .sort(byPosition)
      .map((row) => ({
        id: row.slug,
        title: localized(row.title_fr, row.title_en, row.title_ar) ?? {
          fr: row.title_fr,
        },
        subtitle: localized(
          row.subtitle_fr,
          row.subtitle_en,
          row.subtitle_ar
        ),
        items: (row.dishes ?? [])
          .filter((d) => d.is_available)
          .sort(byPosition)
          .map(toMenuItem),
      }))
      // A category with nothing visible in it renders as an empty section
      // with a heading and no dishes — hide it instead.
      .filter((category) => category.items.length > 0);

    // An entirely empty database almost certainly means the seed never ran.
    // Showing the snapshot is friendlier than showing a blank page.
    return categories.length > 0 ? categories : fallbackMenu;
  } catch (err) {
    console.error(
      "[menu] Supabase read failed — serving data/menu.json snapshot.",
      err
    );
    return fallbackMenu;
  }
}
