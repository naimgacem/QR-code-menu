import type { ReactNode } from "react";

type Props = {
  search: ReactNode;
  nav: ReactNode;
};

export function StickyMenuHeader({ search, nav }: Props) {
  return (
    <div className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur-md">
      <div className="mx-auto max-w-xl px-5 pb-1.5 pt-2 sm:px-6">{search}</div>
      {nav}
    </div>
  );
}
