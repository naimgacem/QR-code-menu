import { Hero } from "@/components/Hero";
import { NoticeSystem } from "@/components/NoticeSystem";
import { MenuExplorer } from "@/components/MenuExplorer";
import { Contact } from "@/components/Contact";
import { StickyCallButton } from "@/components/StickyCallButton";

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-xl overflow-x-clip bg-sand-50 md:shadow-[0_0_60px_-15px_rgba(15,14,12,0.18)] md:ring-1 md:ring-sand-300/60">
      <Hero />
      <NoticeSystem />

      <section
        id="menu"
        aria-label="Carte du restaurant"
        className="bg-sand-50"
      >
        <MenuExplorer />
      </section>

      <Contact />
      <StickyCallButton />
    </main>
  );
}
