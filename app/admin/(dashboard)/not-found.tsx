import Link from "next/link";
import { buttonClass } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { SearchIcon } from "@/components/admin/icons";

export default function AdminNotFound() {
  return (
    <div className="pt-6">
      <EmptyState
        icon={<SearchIcon className="h-6 w-6" />}
        title="Introuvable"
        action={
          <Link href="/admin/dishes" className={buttonClass("primary", "md")}>
            Retour aux plats
          </Link>
        }
      >
        Cet élément n&apos;existe plus — il a probablement été supprimé.
      </EmptyState>
    </div>
  );
}
