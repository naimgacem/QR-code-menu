import { Hero } from "@/components/Hero";
import { NoticeSystem } from "@/components/NoticeSystem";
import { MenuExplorer } from "@/components/MenuExplorer";
import { Contact } from "@/components/Contact";
import { StickyCallButton } from "@/components/StickyCallButton";

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
      <StickyCallButton />
    </main>
  );
}
