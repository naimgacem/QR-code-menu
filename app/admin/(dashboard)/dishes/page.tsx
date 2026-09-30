import Link from "next/link";
import { listCategoriesWithDishes } from "@/lib/admin/queries";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { buttonClass } from "@/components/admin/ui/Button";
import {
  DISH_FILTERS,
  DishList,
  type DishFilter,
} from "@/components/admin/DishList";
import { LayersIcon, PlusIcon } from "@/components/admin/icons";

const parseFilter = (value: string | string[] | undefined): DishFilter =>
  typeof value === "string" && (DISH_FILTERS as string[]).includes(value)
    ? (value as DishFilter)
    : "all";

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, categories] = await Promise.all([
    searchParams,
    listCategoriesWithDishes(),
  ]);

  const dishCount = categories.reduce((n, c) => n + c.dishes.length, 0);

  // Dishes can only exist inside a category, so an empty menu sends the
  // owner to create one rather than to a dish form with no valid parent.
  if (categories.length === 0) {
    return (
      <>
        <PageHeader title="Plats" />
        <EmptyState
          icon={<LayersIcon className="h-6 w-6" />}
          title="Créez d'abord une catégorie"
          action={
            <Link
              href="/admin/categories/new"
              className={buttonClass("primary", "lg")}
            >
              <PlusIcon className="h-[18px] w-[18px]" />
              Créer une catégorie
            </Link>
          }
        >
          Chaque plat appartient à une catégorie — Salades, Plats
          traditionnels, Pâtisseries…
        </EmptyState>
      </>
    );
  }

  return (
    <DishList
      categories={categories}
      summary={`${dishCount} plat${dishCount > 1 ? "s" : ""} · ${
        categories.length
      } catégorie${categories.length > 1 ? "s" : ""}`}
      initialFilter={parseFilter(params.filter)}
      initialCategory={
        typeof params.category === "string" ? params.category : null
      }
    />
  );
}
