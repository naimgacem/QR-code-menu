import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader
        title="Nouvelle catégorie"
        subtitle="Une nouvelle section de la carte. Elle s'affiche dès qu'elle contient un plat visible."
        back={{ href: "/admin/categories", label: "Catégories" }}
      />
      <CategoryForm />
    </>
  );
}
