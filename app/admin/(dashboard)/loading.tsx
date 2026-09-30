import { DashboardSkeleton } from "@/components/admin/ui/Skeleton";

/** Shown while the dashboard home streams in. Deeper routes have their own
 * skeletons, shaped like the screen they stand in for. */
export default function AdminLoading() {
  return <DashboardSkeleton />;
}
