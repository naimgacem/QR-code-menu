/**
 * Re-mounts on every navigation inside the dashboard, so each screen fades
 * in rather than snapping. Opacity only — see `.animate-admin-page` in
 * globals.css for why a slide would break the fixed save bar.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-admin-page">{children}</div>;
}
