import Image from "next/image";
import { ImageIcon } from "./icons";

const SIZES = {
  sm: { box: "h-10 w-10 rounded-lg", px: 40, icon: "h-4 w-4" },
  md: { box: "h-14 w-14 rounded-xl", px: 56, icon: "h-5 w-5" },
} as const;

/** Square dish photo for lists, with a quiet placeholder when there is
 * none — the "Sans photo" filter exists to make those easy to spot. */
export function DishThumb({
  src,
  size = "md",
  dimmed = false,
}: {
  src: string | null;
  size?: keyof typeof SIZES;
  /** Hidden dishes fade back so visible ones read first. */
  dimmed?: boolean;
}) {
  const s = SIZES[size];

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`grid flex-shrink-0 place-items-center border border-dashed border-line bg-surface-2/60 text-subtle ${s.box}`}
      >
        <ImageIcon className={s.icon} />
      </div>
    );
  }

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden bg-surface-2 ring-1 ring-inset ring-line-soft ${s.box} ${
        dimmed ? "opacity-45 grayscale-[35%]" : ""
      }`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${s.px * 2}px`}
        className="object-cover"
      />
    </div>
  );
}
