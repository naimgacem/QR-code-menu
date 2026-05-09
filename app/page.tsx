import { Hero } from "@/components/Hero";
import { NoticeBar } from "@/components/NoticeBar";
import { MenuExplorer } from "@/components/MenuExplorer";
import { Contact } from "@/components/Contact";
import { StickyCallButton } from "@/components/StickyCallButton";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Hero />
      <NoticeBar />

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
