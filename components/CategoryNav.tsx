"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "./LanguageProvider";

type Props = {
  categories: { id: string; title: string }[];
};

const SCROLL_LOCK_MS = 800;

export function CategoryNav({ categories }: Props) {
  const t = useT();
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);
  const lockUntilRef = useRef<number>(0);

  useEffect(() => {
    if (!categories.length) return;
    setActiveId((prev) =>
      categories.find((c) => c.id === prev) ? prev : categories[0].id
    );

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntilRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );

    categories.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeEl = nav.querySelector<HTMLAnchorElement>(
      `a[data-id="${activeId}"]`
    );
    if (activeEl) {
      const navRect = nav.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const offset =
        elRect.left - navRect.left - navRect.width / 2 + elRect.width / 2;
      nav.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [activeId]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    // Optimistic active state — chip turns dark immediately on tap,
    // and the IntersectionObserver is muted briefly so it doesn't flip
    // back as in-between sections cross the viewport during smooth scroll.
    setActiveId(id);
    lockUntilRef.current = Date.now() + SCROLL_LOCK_MS;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label={t("categoriesLabel")}>
      <div
        ref={navRef}
        className="no-scrollbar mx-auto flex max-w-xl items-center gap-1 overflow-x-auto px-4 py-2.5"
      >
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              data-id={c.id}
              aria-current={active ? "true" : undefined}
              onClick={(e) => handleClick(e, c.id)}
              className={`relative flex-shrink-0 whitespace-nowrap touch-manipulation select-none rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-150 active:scale-[0.97] ${
                active
                  ? "bg-ink text-sand-50 shadow-sm active:bg-ink-800"
                  : "text-ink-700/70 hover:text-ink active:bg-sand-200 active:text-ink"
              }`}
            >
              {c.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
