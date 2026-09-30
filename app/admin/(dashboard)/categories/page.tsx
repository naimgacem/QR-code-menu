import Link from "next/link";
import { listCategoriesWithDishes } from "@/lib/admin/queries";
import { CategoryList } from "@/components/admin/CategoryList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { buttonClass } from "@/components/admin/ui/Button";
import { LayersIcon, PlusIcon } from "@/components/admin/icons";

export default async function CategoriesPage() {
  const categories = await listCategoriesWithDishes();

  return (
    <>
      <PageHeader
        title="Catégories"
        subtitle={
          categories.length > 0
            ? `${categories.length} catégorie${
                categories.length > 1 ? "s" : ""
              } sur la carte.`
            : undefined
        }
        action={
          categories.length > 0 ? (
            <Link
              href="/admin/categories/new"
              className={buttonClass("primary", "md", "hidden sm:inline-flex")}
            >
              <PlusIcon className="h-[18px] w-[18px]" />
              Nouvelle catégorie
            </Link>
          ) : undefined
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<LayersIcon className="h-6 w-6" />}
          title="Aucune catégorie pour le moment"
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
          Les catégories structurent votre carte — Salades, Plats
          traditionnels, Pâtisseries, Boissons…
        </EmptyState>
      ) : (
        <CategoryList categories={categories} />
      )}
    </>
  );
}
