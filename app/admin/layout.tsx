import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/admin/SetupRequired";

/** The dashboard's UI face. Loaded here rather than in the root layout so
 * customers scanning the QR code never download it. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
});

/** Bold Cormorant for the "Dar El Baraka" wordmark (`font-wordmark`). The
 * root layout only loads 400–600; adding 700 there would preload it for
 * customers too. */
const wordmark = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-admin-wordmark",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Espace propriétaire — Dar El Baraka",
  // The dashboard must never surface in search results or link previews.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

/** The admin is always rendered per-request — it reads the session cookie
 * and must never be cached or prerendered. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `.admin-root` swaps in the dashboard palette (app/globals.css).
    // lang/dir are pinned: the menu's language picker writes to <html>, and
    // an owner who last browsed the menu in Arabic must not get an RTL
    // dashboard with Arabic spacing rules.
    <div
      lang="fr"
      dir="ltr"
      className={`${inter.variable} ${wordmark.variable} admin-root min-h-screen bg-app text-fg antialiased`}
    >
      {/* Caught here rather than at each page so a half-finished setup
       * produces instructions instead of a supabase-js stack trace. */}
      {isSupabaseConfigured ? children : <SetupRequired />}
    </div>
  );
}
