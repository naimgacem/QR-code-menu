import { createServerSupabase } from "@/lib/supabase/server";
import type { CategoryRow, DishRow } from "@/lib/supabase/types";

/**
 * Reads for the dashboard.
 *
 * Unlike `getMenu()`, these go through the cookie-bound client and return
 * EVERYTHING — including dishes the owner has hidden from customers, which
 * still need to be visible (and un-hideable) here.
 */

export type CategoryWithDishes = CategoryRow & { dishes: DishRow[] };

const byPosition = (a: { position: number }, b: { position: number }) =>
  a.position - b.position;

/** Thrown when Supabase rejects a read. Pages let it bubble to error.tsx. */
class AdminQueryError extends Error {
  constructor(what: string, cause: string) {
    super(`Impossible de charger ${what} : ${cause}`);
    this.name = "AdminQueryError";
  }
}

export async function listCategoriesWithDishes(): Promise<CategoryWithDishes[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*, dishes(*)");

  if (error) throw new AdminQueryError("le menu", error.message);

  return (data as CategoryWithDishes[])
    .slice()
    .sort(byPosition)
    .map((category) => ({
      ...category,
      dishes: (category.dishes ?? []).slice().sort(byPosition),
    }));
}

export async function listCategories(): Promise<CategoryRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("categories").select("*");

  if (error) throw new AdminQueryError("les catégories", error.message);
  return (data as CategoryRow[]).slice().sort(byPosition);
}

export async function getDish(id: string): Promise<DishRow | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AdminQueryError("ce plat", error.message);
  return (data as DishRow) ?? null;
}

export async function getCategory(id: string): Promise<CategoryRow | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AdminQueryError("cette catégorie", error.message);
  return (data as CategoryRow) ?? null;
}

export type MenuStats = {
  categories: number;
  dishes: number;
  hidden: number;
  withoutPhoto: number;
  /** ISO timestamp of the most recent edit to any dish, or null. */
  lastUpdated: string | null;
};

export async function getMenuStats(): Promise<MenuStats> {
  return computeMenuStats(await listCategoriesWithDishes());
}

/** Pure half of `getMenuStats`, for pages that already hold the menu —
 * the dashboard home used to fetch it twice. */
export function computeMenuStats(categories: CategoryWithDishes[]): MenuStats {
  const dishes = categories.flatMap((c) => c.dishes);

  const lastUpdated = dishes.reduce<string | null>((latest, dish) => {
    if (!latest || dish.updated_at > latest) return dish.updated_at;
    return latest;
  }, null);

  return {
    categories: categories.length,
    dishes: dishes.length,
    hidden: dishes.filter((d) => !d.is_available).length,
    withoutPhoto: dishes.filter((d) => !d.image_url).length,
    lastUpdated,
  };
}
