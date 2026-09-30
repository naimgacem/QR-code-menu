import { listCategoriesWithDishes } from "@/lib/admin/queries";
import { Dashboard } from "@/components/admin/Dashboard";

export default async function AdminHomePage() {
  const categories = await listCategoriesWithDishes();
  return <Dashboard categories={categories} />;
}
