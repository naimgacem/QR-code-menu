import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { restaurant } from "@/lib/restaurant";
import { LanguageProvider } from "@/components/LanguageProvider";
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
  themeColor: "#0F0E0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" className={`${display.variable} ${body.variable}`}>
      <body className="bg-sand-50 font-sans text-ink antialiased">
        <LanguageProvider>
          <SkipLink />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
