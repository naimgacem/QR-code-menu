"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const findTarget = () =>
  typeof document === "undefined"
    ? null
    : document.querySelector(".admin-root") ?? document.body;

/**
 * Renders overlays (dialogs, sheets, the photo editor) as direct children
 * of `.admin-root`, outside every page wrapper.
 *
 * Without it an overlay's z-index only counts inside the nearest stacking
 * context — the page fade-in wrapper was one — and the phone's sticky top
 * bar painted over the photo editor's Annuler / Appliquer buttons. Staying
 * inside `.admin-root` (rather than <body>) keeps the dashboard palette and
 * font.
 *
 * Overlays only open after a tap, never during server rendering, so the
 * target can be resolved on the first client render.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [target] = useState(findTarget);
  return target ? createPortal(children, target) : null;
}
