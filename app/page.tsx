import { Hero } from "@/components/Hero";
import { NoticeSystem } from "@/components/NoticeSystem";
import { MenuExplorer } from "@/components/MenuExplorer";
import { Contact } from "@/components/Contact";
import { BackToTopButton } from "@/components/BackToTopButton";
import { OrderFAB } from "@/components/OrderFAB";
import { OrderSheet } from "@/components/OrderSheet";

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-xl overflow-x-clip bg-app md:shadow-elevated md:ring-1 md:ring-line/60">
      <Hero />
      <NoticeSystem />

      <section
        id="menu"
        aria-label="Carte du restaurant"
        className="bg-app"
      >
        <MenuExplorer />
      </section>

      <Contact />

      <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-3">
        <BackToTopButton />
        <OrderFAB />
      </div>

      <OrderSheet />
    </main>
  );
}
