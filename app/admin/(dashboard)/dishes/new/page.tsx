import { redirect } from "next/navigation";
import { listCategories } from "@/lib/admin/queries";
import { DishForm } from "@/components/admin/DishForm";

export default async function NewDishPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, categories] = await Promise.all([
    searchParams,
    listCategories(),
  ]);

  // A dish has no valid parent yet — the dishes index explains why and
  // offers the fix, so send them there rather than rendering a broken form.
  if (categories.length === 0) redirect("/admin/dishes");

  return (
    <DishForm
      headerProps={{
        title: "Nouveau plat",
        subtitle: "Il apparaîtra sur la carte dès l'enregistrement.",
        back: { href: "/admin/dishes", label: "Plats" },
      }}
      categories={categories}
      initialCategoryId={
        typeof params.category === "string" ? params.category : null
      }
    />
  );
}
