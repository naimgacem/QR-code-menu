import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { restaurant } from "@/lib/restaurant";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OrderProvider } from "@/components/OrderProvider";
import { SkipLink } from "@/components/SkipLink";
import "./globals.css";

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
      className={`${display.variable} ${body.variable}`}
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
      </body>
    </html>
  );
}
