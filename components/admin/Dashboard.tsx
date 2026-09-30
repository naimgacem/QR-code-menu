import Link from "next/link";
import type { ReactNode } from "react";
import type { CategoryWithDishes } from "@/lib/admin/queries";
import { computeMenuStats } from "@/lib/admin/queries";
import { formatPrice, formatRelative } from "@/lib/admin/format";
import { DishThumb } from "./DishThumb";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";
import { buttonClass } from "./ui/Button";
import {
  CheckIcon,
  ChevronRightIcon,
  DishIcon,
  ExternalIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  LayersIcon,
  PlusIcon,
} from "./icons";

/** The owner is in Algiers; the server may not be. */
const TIME_ZONE = "Africa/Algiers";

function greetingFor(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("fr-FR", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: TIME_ZONE,
    }).format(now)
  );
  return hour >= 5 && hour < 18 ? "Bonjour" : "Bonsoir";
}

function longDate(now: Date) {
  const text = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  }).format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function StatCard({
  icon,
  label,
  value,
  detail,
  progress,
  tone = "default",
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  /** 0–1. Renders a thin bar under the figure. */
  progress?: number;
  tone?: "default" | "warning";
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-medium text-muted">{label}</p>
        <span
          aria-hidden="true"
          className={`grid h-7 w-7 place-items-center rounded-lg ${
            tone === "warning"
              ? "bg-warning-soft text-warning"
              : "bg-surface-2 text-subtle"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em] text-fg tabular-nums">
        {value}
      </p>
      {progress !== undefined && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
      <p className="mt-2 truncate text-[12px] text-subtle">{detail}</p>
    </>
  );

  const className =
    "block rounded-2xl border border-line-soft bg-surface p-4 shadow-admin-xs transition-[border-color,box-shadow] duration-150";

  return href ? (
    <Link
      href={href}
      className={`${className} hover:border-line hover:shadow-admin-sm`}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

// ---------------------------------------------------------------------------

export function Dashboard({
  categories,
  now = new Date(),
}: {
  categories: CategoryWithDishes[];
  now?: Date;
}) {
  const stats = computeMenuStats(categories);
  const lastUpdated = formatRelative(stats.lastUpdated);
  const visible = stats.dishes - stats.hidden;
  const withPhoto = stats.dishes - stats.withoutPhoto;
  const photoShare = stats.dishes ? withPhoto / stats.dishes : 0;

  // The owner's likely re-entry point after a price change or photo swap.
  const recent = categories
    .flatMap((category) => category.dishes.map((dish) => ({ dish, category })))
    .sort((a, b) => b.dish.updated_at.localeCompare(a.dish.updated_at))
    .slice(0, 6);

  const largest = Math.max(1, ...categories.map((c) => c.dishes.length));

  const alerts = [
    stats.withoutPhoto > 0 && {
      href: "/admin/dishes?filter=no-photo",
      Icon: ImageIcon,
      label:
        stats.withoutPhoto === 1
          ? "1 plat sans photo"
          : `${stats.withoutPhoto} plats sans photo`,
      hint: "Les plats avec photo sont nettement plus commandés.",
    },
    stats.hidden > 0 && {
      href: "/admin/dishes?filter=hidden",
      Icon: EyeOffIcon,
      label:
        stats.hidden === 1 ? "1 plat masqué" : `${stats.hidden} plats masqués`,
      hint: "Invisibles pour les clients. Pensez à les réafficher.",
    },
  ].filter(Boolean) as {
    href: string;
    Icon: typeof ImageIcon;
    label: string;
    hint: string;
  }[];

  const header = (
    <PageHeader
      title={greetingFor(now)}
      subtitle={
        lastUpdated
          ? `${longDate(now)} · Dernière modification ${lastUpdated}`
          : longDate(now)
      }
      action={
        <>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={buttonClass("secondary", "md", "hidden sm:inline-flex")}
          >
            <ExternalIcon className="h-4 w-4" />
            Voir la carte
          </a>
          <Link
            href="/admin/dishes/new"
            className={buttonClass("primary", "md", "hidden sm:inline-flex")}
          >
            <PlusIcon className="h-[18px] w-[18px]" />
            Nouveau plat
          </Link>
        </>
      }
    />
  );

  if (stats.categories === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<LayersIcon className="h-6 w-6" />}
          title="Votre carte est vide"
          action={
            <Link
              href="/admin/categories/new"
              className={buttonClass("primary", "lg")}
            >
              <PlusIcon className="h-[18px] w-[18px]" />
              Créer une catégorie
            </Link>
          }
        >
          Commencez par créer une catégorie (Entrées, Plats, Desserts…), puis
          ajoutez-y vos plats.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<EyeIcon className="h-4 w-4" />}
          label="Plats visibles"
          value={String(visible)}
          detail={`sur ${stats.dishes} plat${stats.dishes > 1 ? "s" : ""} au total`}
          href="/admin/dishes"
        />
        <StatCard
          icon={<LayersIcon className="h-4 w-4" />}
          label="Catégories"
          value={String(stats.categories)}
          detail="sections de la carte"
          href="/admin/categories"
        />
        <StatCard
          icon={<ImageIcon className="h-4 w-4" />}
          label="Avec photo"
          value={`${Math.round(photoShare * 100)} %`}
          detail={`${withPhoto} sur ${stats.dishes} plats`}
          progress={photoShare}
          href="/admin/dishes?filter=no-photo"
        />
        <StatCard
          icon={<EyeOffIcon className="h-4 w-4" />}
          label="Masqués"
          value={String(stats.hidden)}
          detail={stats.hidden > 0 ? "invisibles pour les clients" : "tout est visible"}
          tone={stats.hidden > 0 ? "warning" : "default"}
          href="/admin/dishes?filter=hidden"
        />
      </div>

      <div className="mt-5 grid items-start grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          title="Modifiés récemment"
          padding="none"
          action={
            <Link
              href="/admin/dishes"
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Tous les plats
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="px-5 pb-5 text-[13.5px] text-muted">
              Aucun plat pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft border-t border-line-soft">
              {recent.map(({ dish, category }) => (
                <li key={dish.id}>
                  <Link
                    href={`/admin/dishes/${dish.id}`}
                    className="flex touch-manipulation items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60"
                  >
                    <DishThumb
                      src={dish.image_url}
                      size="sm"
                      dimmed={!dish.is_available}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-fg">
                        {dish.name_fr}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-subtle">
                        {category.title_fr} ·{" "}
                        {formatRelative(dish.updated_at) ?? "—"}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-[14px] font-semibold tabular-nums text-fg">
                      {formatPrice(dish.price)}
                      <span className="ms-1 text-[11px] font-medium text-subtle">
                        DA
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="À vérifier" padding="none">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-3 px-5 pb-5">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-success-soft text-success">
                  <CheckIcon className="h-[18px] w-[18px]" />
                </span>
                <p className="text-[13.5px] leading-snug text-muted">
                  Tout est en ordre : chaque plat a sa photo et est visible.
                </p>
              </div>
            ) : (
              <ul className="space-y-1 px-2 pb-2">
                {alerts.map(({ href, Icon, label, hint }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/70"
                    >
                      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium leading-snug text-fg">
                          {label}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-subtle">
                          {hint}
                        </span>
                      </span>
                      <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Par catégorie" padding="none">
            <ul className="space-y-0.5 px-2 pb-2">
              {categories.map((category) => {
                const count = category.dishes.length;
                return (
                  <li key={category.id}>
                    <Link
                      href={`/admin/dishes?category=${category.id}`}
                      className="block rounded-xl px-3 py-2 transition-colors hover:bg-surface-2/70"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[13.5px] font-medium text-fg">
                          {category.title_fr}
                        </span>
                        <span className="flex-shrink-0 text-[12.5px] tabular-nums text-subtle">
                          {count}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-2"
                      >
                        <span
                          className="block h-full rounded-full bg-accent/70"
                          style={{ width: `${(count / largest) * 100}%` }}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      {/* Phones get the two header actions as a pair of big targets. */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:hidden">
        <Link href="/admin/dishes/new" className={buttonClass("primary", "lg")}>
          <DishIcon className="h-[18px] w-[18px]" />
          Nouveau plat
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={buttonClass("secondary", "lg")}
        >
          <ExternalIcon className="h-4 w-4" />
          Voir la carte
        </a>
      </div>
    </>
  );
}
