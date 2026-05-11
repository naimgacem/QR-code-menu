import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { restaurant } from "@/lib/restaurant";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F1E1" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0A05" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Anti-FOIT (flash of incorrect theme): set data-theme on <html> before
// React hydrates, using the stored choice or the OS preference.
const themeBootScript = `
(function () {
  try {
    var k = "deb-theme";
    var stored = localStorage.getItem(k);
    var t = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
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
      data-theme="light"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <body className="bg-frame font-sans text-fg antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>
          <LanguageProvider>
            <SkipLink />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
