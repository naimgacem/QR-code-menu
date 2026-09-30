import { notFound } from "next/navigation";
import { getDish, listCategories } from "@/lib/admin/queries";
import { formatRelative } from "@/lib/admin/format";
import { DishForm } from "@/components/admin/DishForm";
import { Badge } from "@/components/admin/ui/Badge";

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dish, categories] = await Promise.all([
    getDish(id),
    listCategories(),
  ]);

  if (!dish) notFound();

  const updated = formatRelative(dish.updated_at);
  const category = categories.find((c) => c.id === dish.category_id);

  return (
    <DishForm
      dish={dish}
      categories={categories}
      headerProps={{
        title: dish.name_fr,
        eyebrow: dish.is_available ? (
          <Badge tone="success" dot>
            Visible sur la carte
          </Badge>
        ) : (
          <Badge dot>Masqué</Badge>
        ),
        subtitle: [category?.title_fr, updated && `modifié ${updated}`]
          .filter(Boolean)
          .join(" · "),
        back: { href: "/admin/dishes", label: "Plats" },
      }}
    />
  );
}
