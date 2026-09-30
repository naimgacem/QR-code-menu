import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already redirects anonymous requests. This is the second
  // lock: if the matcher is ever narrowed or middleware is skipped, the
  // dashboard still refuses to render without a verified session.
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
