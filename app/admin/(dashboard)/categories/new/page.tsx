import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <CategoryForm
      headerProps={{
        title: "Nouvelle catégorie",
        subtitle:
          "Une nouvelle section de la carte. Elle s'affiche dès qu'elle contient un plat visible.",
        back: { href: "/admin/categories", label: "Catégories" },
      }}
    />
  );
}
