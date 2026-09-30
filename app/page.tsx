import { getMenu } from "@/lib/menu-data";
import { MenuProvider } from "@/components/MenuProvider";
import { OrderMenuSync } from "@/components/OrderMenuSync";
import { Hero } from "@/components/Hero";
import { NoticeSystem } from "@/components/NoticeSystem";
import { MenuTitle } from "@/components/MenuTitle";
import { MenuExplorer } from "@/components/MenuExplorer";
import { Contact } from "@/components/Contact";
import { BackToTopButton } from "@/components/BackToTopButton";
import { OrderFAB } from "@/components/OrderFAB";
import { OrderSheet } from "@/components/OrderSheet";

/**
 * Statically generated, with a one-hour safety net.
 *
 * The page is normally refreshed the instant the owner saves — every admin
 * write calls `revalidatePath("/")`. This hourly window only matters if that
 * call is ever lost (a crashed action, a rolled-back deploy), so the menu
 * can't drift stale indefinitely.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const menu = await getMenu();

  return (
    <MenuProvider menu={menu}>
      <main className="relative mx-auto min-h-screen max-w-xl overflow-x-clip bg-app md:shadow-elevated md:ring-1 md:ring-line/60">
        <Hero />
        <NoticeSystem />

        <section id="menu" aria-label="Carte du restaurant" className="bg-app">
          <MenuTitle />
          <MenuExplorer />
        </section>

        <Contact />

        <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-3">
          <BackToTopButton />
          <OrderFAB />
        </div>

        <OrderSheet />
        <OrderMenuSync />
      </main>
    </MenuProvider>
  );
}
