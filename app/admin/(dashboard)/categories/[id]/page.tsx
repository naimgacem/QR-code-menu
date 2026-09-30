import { notFound } from "next/navigation";
import { listCategoriesWithDishes } from "@/lib/admin/queries";
import { formatRelative } from "@/lib/admin/format";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // One query: the form lists the category's dishes, and the delete dialog
  // needs to say exactly how many go with it.
  const category = (await listCategoriesWithDishes()).find((c) => c.id === id);

  if (!category) notFound();

  const count = category.dishes.length;
  const updated = formatRelative(category.updated_at);

  return (
    <>
      <PageHeader
        title={category.title_fr}
        subtitle={[
          count > 0 ? `${count} plat${count > 1 ? "s" : ""}` : "Aucun plat",
          updated && `modifiée ${updated}`,
        ]
          .filter(Boolean)
          .join(" · ")}
        back={{ href: "/admin/categories", label: "Catégories" }}
      />
      <CategoryForm category={category} dishes={category.dishes} />
    </>
  );
}
