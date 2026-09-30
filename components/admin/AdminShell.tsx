"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "./BrandMark";
import { buttonClass, iconButtonClass } from "./ui/Button";
import { isModalOpen, isTypingTarget } from "./ui/keyboard";
import { Segmented } from "./ui/Segmented";
import { Sheet, SheetItem } from "./ui/Sheet";
import { ToastProvider, useToast } from "./ui/Toast";
import {
  CopyIcon,
  DishIcon,
  ExternalIcon,
  HomeIcon,
  LayersIcon,
  LogoutIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
} from "./icons";

const NAV = [
  { href: "/admin", label: "Accueil", Icon: HomeIcon, exact: true },
  { href: "/admin/dishes", label: "Plats", Icon: DishIcon, exact: false },
  {
    href: "/admin/categories",
    label: "Catégories",
    Icon: LayersIcon,
    exact: false,
  },
] as const;

const isActive = (pathname: string, href: string, exact: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/** Create/edit screens are pushed views: on phones they trade the tab bar
 * for their own save bar, the way a native app would. */
const isDetailRoute = (pathname: string) =>
  /^\/admin\/(dishes|categories)\/[^/]+/.test(pathname);

// ---------------------------------------------------------------------------

function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // Even if the network call fails, send them to the login screen —
      // middleware will re-check the session there.
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return { signOut, pending };
}

function useCopyMenuLink() {
  const toast = useToast();
  return async () => {
    const url = `${window.location.origin}/`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien de la carte copié.");
    } catch {
      toast.error("Copie impossible — le lien est " + url);
    }
  };
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <Segmented
      label="Thème"
      size="sm"
      fullWidth
      value={theme}
      onChange={setTheme}
      options={[
        { value: "light", label: "Clair", icon: <SunIcon className="h-4 w-4" /> },
        { value: "dark", label: "Sombre", icon: <MoonIcon className="h-4 w-4" /> },
      ]}
    />
  );
}

function Avatar({ email }: { email: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-semibold uppercase text-accent-strong"
    >
      {email.trim().charAt(0) || "?"}
    </span>
  );
}

// ---------------------------------------------------------------------------

function Sidebar({ email, pathname }: { email: string; pathname: string }) {
  const { signOut, pending } = useSignOut();
  const copyLink = useCopyMenuLink();

  const linkRow =
    "flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-[13.5px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg";

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-line-soft bg-surface md:flex">
      <div className="px-5 pb-5 pt-6">
        <Wordmark />
      </div>

      <div className="px-3">
        <Link
          href="/admin/dishes/new"
          className={buttonClass("primary", "md", "w-full justify-between")}
        >
          <span className="inline-flex items-center gap-2">
            <PlusIcon className="h-[18px] w-[18px]" />
            Nouveau plat
          </span>
          <kbd className="rounded-md bg-action-fg/15 px-1.5 font-sans text-[11px] font-medium">
            N
          </kbd>
        </Link>
      </div>

      <nav aria-label="Navigation principale" className="mt-6 px-3">
        <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
          Gestion
        </p>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-lg px-2.5 text-[14px] transition-colors ${
                    active
                      ? "bg-surface-2 font-semibold text-fg"
                      : "font-medium text-muted hover:bg-surface-2/70 hover:text-fg"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active ? "text-accent-strong" : ""
                    }`}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 px-3">
        <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
          Carte en ligne
        </p>
        <a href="/" target="_blank" rel="noreferrer" className={linkRow}>
          <ExternalIcon className="h-[18px] w-[18px]" />
          Voir la carte
        </a>
        <button type="button" onClick={copyLink} className={linkRow}>
          <CopyIcon className="h-[18px] w-[18px]" />
          Copier le lien
        </button>
      </div>

      <div className="mt-auto space-y-3 border-t border-line-soft p-3">
        <ThemeSwitch />
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1">
          <Avatar email={email} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-fg">
              Propriétaire
            </p>
            <p className="truncate text-[11.5px] text-subtle">{email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={pending}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className={iconButtonClass("sm")}
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileTabs({
  pathname,
  onCreate,
  onAccount,
}: {
  pathname: string;
  onCreate: () => void;
  onAccount: () => void;
}) {
  const tab = (active: boolean) =>
    `flex h-16 w-full touch-manipulation flex-col items-center justify-center gap-1 transition-colors ${
      active ? "text-accent-strong" : "text-subtle active:text-fg"
    }`;
  const [home, dishes, categories] = NAV;

  const navLink = ({ href, label, Icon, exact }: (typeof NAV)[number]) => {
    const active = isActive(pathname, href, exact);
    return (
      <li className="flex-1">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={tab(active)}
        >
          <Icon className="h-[22px] w-[22px]" />
          <span className="text-[10.5px] font-medium">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="flex items-center px-1">
        {navLink(home)}
        {navLink(dishes)}
        <li className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onCreate}
            aria-label="Ajouter"
            className="grid h-12 w-12 touch-manipulation place-items-center rounded-2xl bg-action text-action-fg shadow-admin-md transition-transform active:scale-95"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </li>
        {navLink(categories)}
        <li className="flex-1">
          <button type="button" onClick={onAccount} className={tab(false)}>
            <UserIcon className="h-[22px] w-[22px]" />
            <span className="text-[10.5px] font-medium">Compte</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------

function ShellInner({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, pending } = useSignOut();
  const copyLink = useCopyMenuLink();
  const [sheet, setSheet] = useState<"create" | "account" | null>(null);
  const detail = isDetailRoute(pathname);

  // "N" anywhere in the dashboard starts a new dish — the most common
  // desktop task, one key away.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target) || isModalOpen()) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/admin/dishes/new");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const go = (href: string) => {
    setSheet(null);
    router.push(href);
  };

  return (
    <div className="min-h-screen">
      <Sidebar email={email} pathname={pathname} />

      {/* ---- mobile top bar ---- */}
      <header className="sticky top-0 z-30 border-b border-line-soft bg-app/85 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/admin" aria-label="Accueil" className="min-w-0">
            <Wordmark compact />
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="Voir la carte (nouvel onglet)"
            className={iconButtonClass("md")}
          >
            <ExternalIcon className="h-[19px] w-[19px]" />
          </a>
        </div>
      </header>

      {/* ---- page content ----
       * Bottom padding clears the fixed tab bar (or the form save bar on
       * detail screens) plus the iPhone home indicator. */}
      <div className="md:ps-64">
        <main
          id="main"
          className="mx-auto max-w-5xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 md:px-8 md:pb-16 md:pt-10 lg:px-10"
        >
          {children}
        </main>
      </div>

      {!detail && (
        <MobileTabs
          pathname={pathname}
          onCreate={() => setSheet("create")}
          onAccount={() => setSheet("account")}
        />
      )}

      <Sheet
        open={sheet === "create"}
        onClose={() => setSheet(null)}
        title="Ajouter"
      >
        <div className="space-y-1">
          <SheetItem
            icon={<DishIcon className="h-5 w-5" />}
            label="Nouveau plat"
            description="Nom, prix, photo et catégorie."
            onClick={() => go("/admin/dishes/new")}
          />
          <SheetItem
            icon={<LayersIcon className="h-5 w-5" />}
            label="Nouvelle catégorie"
            description="Une section de la carte : Salades, Desserts…"
            onClick={() => go("/admin/categories/new")}
          />
        </div>
      </Sheet>

      <Sheet
        open={sheet === "account"}
        onClose={() => setSheet(null)}
        title="Compte"
        description={email}
      >
        <div className="px-2 pb-3 pt-1">
          <ThemeSwitch />
        </div>
        <div className="space-y-1">
          <SheetItem
            icon={<ExternalIcon className="h-5 w-5" />}
            label="Voir la carte"
            description="Telle que la voient vos clients."
            href="/"
            external
            onClick={() => setSheet(null)}
          />
          <SheetItem
            icon={<CopyIcon className="h-5 w-5" />}
            label="Copier le lien de la carte"
            onClick={() => {
              setSheet(null);
              void copyLink();
            }}
          />
          <SheetItem
            icon={<LogoutIcon className="h-5 w-5" />}
            label={pending ? "Déconnexion…" : "Se déconnecter"}
            tone="danger"
            onClick={signOut}
          />
        </div>
      </Sheet>
    </div>
  );
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <ShellInner email={email}>{children}</ShellInner>
    </ToastProvider>
  );
}

