import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Amiri, Cairo, Cormorant_Garamond, Manrope } from "next/font/google";
import { restaurant } from "@/lib/restaurant";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OrderProvider } from "@/components/OrderProvider";
import { SkipLink } from "@/components/SkipLink";
import "./globals.css";

/** GA4 Measurement ID. Public — safe to commit. To swap without code changes,
 * set NEXT_PUBLIC_GA_ID at build time and it overrides this default. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-TVNJZWCKGF";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const arabicBody = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const arabicDisplay = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${restaurant.name} — Cuisine traditionnelle algéroise · Casbah`,
  description:
    "Carte du restaurant Dar El Baraka, niché au cœur de la Casbah d'Alger. Plats traditionnels, poissons frais et pâtisseries faites maison.",
  keywords: [
    "Dar El Baraka",
    "Restaurant Casbah",
    "Cuisine algérienne",
    "Couscous Alger",
    "Rechta",
    "Poisson grillé",
    "Restaurant Alger",
  ],
  openGraph: {
    title: `${restaurant.name} — Casbah, Alger`,
    description:
      "Cuisine traditionnelle algéroise, poissons du jour et thé à la menthe. Carte digitale du restaurant Dar El Baraka.",
    images: [restaurant.logoUrl],
    locale: "fr_DZ",
    type: "website",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: restaurant.logoUrl,
    apple: restaurant.logoUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0A05",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Anti-FOIT (flash of incorrect theme): set data-theme on <html> before
// React hydrates. Defaults to dark; only honors an explicit user choice
// saved via the toggle. OS preference is intentionally ignored — the
// restaurant's identity is the dark evening palette.
const themeBootScript = `
(function () {
  try {
    var k = "deb-theme";
    var stored = localStorage.getItem(k);
    var t = stored === "dark" || stored === "light" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      dir="ltr"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${arabicBody.variable} ${arabicDisplay.variable}`}
    >
      <body className="bg-frame font-sans text-fg antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>
          <LanguageProvider>
            <OrderProvider>
              <SkipLink />
              {children}
            </OrderProvider>
          </LanguageProvider>
        </ThemeProvider>

        {/* Google Analytics 4 — loaded after the page becomes interactive
         * so it never competes with the menu's first paint. Disabled in
         * dev so localhost traffic doesn't pollute the property. */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
