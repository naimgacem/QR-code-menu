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
    setActiveId(id);
    lockUntilRef.current = Date.now() + SCROLL_LOCK_MS;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label={t("categoriesLabel")} className="px-4 py-2.5">
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-full bg-surface ring-1 ring-line-soft shadow-[0_2px_10px_-4px_rgb(var(--fg)/0.14)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-surface via-surface/80 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-surface via-surface/80 to-transparent"
        />

        <div
          ref={navRef}
          className="no-scrollbar flex overflow-x-auto overscroll-x-contain scroll-smooth py-1.5"
        >
          <div className="mx-auto flex items-center gap-1 px-3">
            {categories.map((c) => {
              const active = c.id === activeId;
              return (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  data-id={c.id}
                  aria-current={active ? "true" : undefined}
                  onClick={(e) => handleClick(e, c.id)}
                  className={`relative flex-shrink-0 whitespace-nowrap touch-manipulation select-none rounded-full px-3.5 py-1.5 text-[12.5px] font-medium leading-none tracking-wide transition-all duration-200 ease-out active:scale-[0.95] ${
                    active
                      ? "bg-action text-action-fg shadow-sm"
                      : "bg-surface-2 text-muted hover:text-fg active:bg-surface-muted"
                  }`}
                >
                  {c.title}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
