"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, iconButtonClass, Spinner } from "./ui/Button";
import { Segmented } from "./ui/Segmented";
import { Slider } from "./ui/Slider";
import { Portal } from "./ui/Portal";
import { useModal } from "./ui/useModal";
import {
  CloseIcon,
  CompareIcon,
  CropIcon,
  FlipIcon,
  ResetIcon,
  RotateLeftIcon,
  RotateRightIcon,
  SlidersIcon,
  SparkleIcon,
} from "./icons";

/** 4:3 — the ratio MenuItemCard already falls back to, so edited photos
 * drop into the existing card layout without shifting anything. */
export const CROP_ASPECT = 4 / 3;
export const OUTPUT_WIDTH = 1200;
export const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / CROP_ASPECT);

const MAX_ZOOM = 4;
/** Above this the file is re-encoded at a lower quality. Phone photos are
 * routinely 4–8 MB; the menu is browsed on Algerian mobile data. */
const TARGET_BYTES = 260_000;
const QUALITY_STEPS = [0.85, 0.72, 0.6, 0.5];
/** iOS Safari refuses canvases above ~16.7 M pixels — a 48 MP photo would
 * decode fine and then silently draw nothing. */
const MAX_SOURCE_PIXELS = 16_000_000;
/** Display copies of the photo. The large one is what you see at rest; the
 * small one keeps the colour sliders fluid while they are being dragged. */
const PREVIEW_LARGE = 1600;
const PREVIEW_SMALL = 560;
/** Breathing room around the crop frame, where the cut-off part of the
 * photo stays visible (dimmed) so you can see what you are leaving out. */
const FRAME_PADDING = 22;

export type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
};

const NEUTRAL: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
};

/** Everything needed to reopen the editor exactly where the owner left it. */
export type EditorState = {
  /** Clockwise quarter turns, 0–3. */
  quarterTurns: number;
  /** Fine rotation in degrees, −45 to 45. */
  straighten: number;
  /** 1 = the photo just covers the frame. */
  zoom: number;
  flipped: boolean;
  /** Pan as a fraction of the frame's width/height — the frame is a
   * different size on a phone, a rotated phone, and a desktop. */
  pan: { x: number; y: number };
  adjustments: Adjustments;
};

const INITIAL_STATE: EditorState = {
  quarterTurns: 0,
  straighten: 0,
  zoom: 1,
  flipped: false,
  pan: { x: 0, y: 0 },
  adjustments: NEUTRAL,
};

export type CroppedImage = {
  blob: Blob;
  width: number;
  height: number;
  extension: string;
};

type Raster = { source: CanvasImageSource; width: number; height: number };
type Frame = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

// ---------------------------------------------------------------------------
// Raster helpers
// ---------------------------------------------------------------------------

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

const asRaster = (canvas: HTMLCanvasElement): Raster => ({
  source: canvas,
  width: canvas.width,
  height: canvas.height,
});

/** Downscale in halving steps, then one final step. A single large
 * drawImage downscale skips source pixels and shimmers — and Safari
 * ignores imageSmoothingQuality. */
function scaleTo(src: Raster, width: number, height: number) {
  let current = src;
  while (current.width / 2 >= width && current.height / 2 >= height) {
    const { canvas, ctx } = makeCanvas(current.width / 2, current.height / 2);
    ctx.drawImage(current.source, 0, 0, canvas.width, canvas.height);
    current = asRaster(canvas);
  }
  const { canvas, ctx } = makeCanvas(width, height);
  ctx.drawImage(current.source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function fitWithin(src: Raster, maxEdge: number) {
  const f = Math.min(1, maxEdge / Math.max(src.width, src.height));
  return scaleTo(src, src.width * f, src.height * f);
}

/** Shrink factor that keeps a w×h image under the canvas pixel cap. */
const safeFactor = (w: number, h: number) =>
  Math.min(1, Math.sqrt(MAX_SOURCE_PIXELS / (w * h)));

function decodeWithImg(blob: Blob): Promise<Raster> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      try {
        // Copied into a canvas so the object URL can be released now.
        const f = safeFactor(img.naturalWidth, img.naturalHeight);
        const { canvas, ctx } = makeCanvas(
          img.naturalWidth * f,
          img.naturalHeight * f
        );
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(asRaster(canvas));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

/** Decodes with EXIF orientation applied, so photos taken in portrait on a
 * phone don't land sideways. Falls back to <img> where createImageBitmap
 * lacks the option. */
async function decode(blob: Blob): Promise<Raster> {
  let raster: Raster;
  try {
    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "from-image",
    });
    raster = { source: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    return decodeWithImg(blob);
  }
  const f = safeFactor(raster.width, raster.height);
  if (f < 1) {
    const canvas = scaleTo(raster, raster.width * f, raster.height * f);
    (raster.source as ImageBitmap).close();
    return asRaster(canvas);
  }
  return raster;
}

async function encode(canvas: HTMLCanvasElement): Promise<CroppedImage> {
  for (const quality of QUALITY_STEPS) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) continue;
    if (blob.size <= TARGET_BYTES || quality === QUALITY_STEPS.at(-1)) {
      return {
        blob,
        width: canvas.width,
        height: canvas.height,
        extension: "jpg",
      };
    }
  }
  throw new Error("encode failed");
}

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

const isNeutral = (a: Adjustments) =>
  !a.brightness && !a.contrast && !a.saturation && !a.warmth;

const keyOf = (a: Adjustments) =>
  `${a.brightness}|${a.contrast}|${a.saturation}|${a.warmth}`;

/** Per-channel lookup tables for brightness, contrast and warmth. */
function buildCurves(a: Adjustments) {
  const b = a.brightness / 100;
  const c = a.contrast / 100;
  const w = a.warmth / 100;
  // Brightness as a gamma curve: lifts or deepens the midtones without
  // clipping the whites or crushing the blacks, as adding a constant would.
  const gamma = b >= 0 ? 1 / (1 + b * 0.9) : 1 - b * 0.9;
  const slope = c >= 0 ? 1 + c * 0.85 : 1 + c * 0.6;

  const red = new Uint8ClampedArray(256);
  const green = new Uint8ClampedArray(256);
  const blue = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    const v = (Math.pow(i / 255, gamma) - 0.5) * slope + 0.5;
    red[i] = v * (1 + w * 0.14) * 255;
    green[i] = v * (1 + w * 0.03) * 255;
    blue[i] = v * (1 - w * 0.14) * 255;
  }
  return { red, green, blue };
}

/** Applies the adjustments in place. The same function runs on the preview
 * and on the final 1200×900 export, so what you see is what gets saved. */
function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  a: Adjustments
) {
  if (isNeutral(a)) return;
  const image = ctx.getImageData(0, 0, width, height);
  const d = image.data;
  const { red, green, blue } = buildCurves(a);
  const sat = 1 + a.saturation / 100;

  for (let i = 0; i < d.length; i += 4) {
    let r = red[d[i]];
    let g = green[d[i + 1]];
    let b = blue[d[i + 2]];
    if (sat !== 1) {
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = y + (r - y) * sat;
      g = y + (g - y) * sat;
      b = y + (b - y) * sat;
    }
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
  ctx.putImageData(image, 0, 0);
}

function adjustedCopy(
  src: HTMLCanvasElement,
  a: Adjustments,
  reuse: HTMLCanvasElement | null
) {
  const canvas = reuse ?? document.createElement("canvas");
  if (canvas.width !== src.width) canvas.width = src.width;
  if (canvas.height !== src.height) canvas.height = src.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(src, 0, 0);
  applyAdjustments(ctx, canvas.width, canvas.height, a);
  return canvas;
}

const clampInt = (v: number, lo: number, hi: number) =>
  Math.round(Math.min(hi, Math.max(lo, v)));

/** One-tap correction from the photo's histogram: lifts a dark shot,
 * stretches a flat one, and adds a little colour — food under restaurant
 * lighting tends to come out dim and grey. */
function autoAdjust(src: HTMLCanvasElement): Adjustments {
  const ctx = src.getContext("2d");
  if (!ctx) return NEUTRAL;
  const { data } = ctx.getImageData(0, 0, src.width, src.height);
  const histogram = new Uint32Array(256);
  let sum = 0;
  let chroma = 0;
  let n = 0;
  // Every 4th pixel is plenty for a histogram.
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    histogram[y]++;
    sum += y;
    chroma += Math.max(r, g, b) - Math.min(r, g, b);
    n++;
  }
  const percentile = (p: number) => {
    let acc = 0;
    for (let i = 0; i < 256; i++) {
      acc += histogram[i];
      if (acc >= n * p) return i;
    }
    return 255;
  };
  const mean = sum / n / 255;
  const spread = (percentile(0.99) - percentile(0.01)) / 255;
  const colourfulness = chroma / n / 255;

  return {
    brightness: clampInt((0.52 - mean) * 150, -20, 35),
    contrast: clampInt((0.9 / Math.max(spread, 0.35) - 1) * 70, 0, 30),
    saturation: clampInt((0.32 - colourfulness) * 90 + 8, 0, 30),
    warmth: 6,
  };
}

type Preset = { id: string; label: string; values: Adjustments | "auto" };

const PRESETS: Preset[] = [
  { id: "original", label: "Original", values: NEUTRAL },
  { id: "auto", label: "Auto", values: "auto" },
  {
    id: "lumineux",
    label: "Lumineux",
    values: { brightness: 28, contrast: 6, saturation: 6, warmth: 0 },
  },
  {
    id: "gourmand",
    label: "Gourmand",
    values: { brightness: 10, contrast: 16, saturation: 26, warmth: 22 },
  },
  {
    id: "vif",
    label: "Vif",
    values: { brightness: 6, contrast: 26, saturation: 38, warmth: 0 },
  },
  {
    id: "doux",
    label: "Doux",
    values: { brightness: 16, contrast: -18, saturation: -8, warmth: 10 },
  },
  {
    id: "frais",
    label: "Frais",
    values: { brightness: 10, contrast: 10, saturation: 4, warmth: -24 },
  },
];

// ---------------------------------------------------------------------------
// Geometry
//
// The photo is drawn as: translate(frame centre + pan) · rotate(angle) ·
// scale(k, flipped ? −k : k on x) around its own centre. `k` is the scale at
// which the rotated photo exactly covers the frame, times zoom.
// ---------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function frameFor(width: number, height: number): Frame {
  const availW = Math.max(1, width - FRAME_PADDING * 2);
  const availH = Math.max(1, height - FRAME_PADDING * 2);
  let w = availW;
  let h = w / CROP_ASPECT;
  if (h > availH) {
    h = availH;
    w = h * CROP_ASPECT;
  }
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

const angleOf = (s: EditorState) =>
  (s.quarterTurns * Math.PI) / 2 + (s.straighten * Math.PI) / 180;

/** Smallest scale at which a W×H photo turned by `theta` covers the frame. */
function coverScale(theta: number, f: Frame, W: number, H: number) {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  return Math.max((f.w * c + f.h * s) / W, (f.w * s + f.h * c) / H);
}

/**
 * Nearest pan (screen px from the frame centre) that keeps the frame fully
 * covered — you can never drag a blank corner into the crop, even with the
 * photo tilted. In the photo's own rotated axes the allowed pans form a
 * plain rectangle, so: rotate in, clamp, rotate back.
 */
function clampPan(p: Point, theta: number, k: number, W: number, H: number, f: Frame): Point {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const ex = (f.w * Math.abs(c) + f.h * Math.abs(s)) / k;
  const ey = (f.w * Math.abs(s) + f.h * Math.abs(c)) / k;
  const mx = Math.max(0, (W - ex) / 2);
  const my = Math.max(0, (H - ey) / 2);
  const lx = clamp((c * p.x + s * p.y) / k, -mx, mx);
  const ly = clamp((-s * p.x + c * p.y) / k, -my, my);
  return { x: k * (c * lx - s * ly), y: k * (s * lx + c * ly) };
}

const centerOf = (points: Point[]) => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

const distanceOf = (points: Point[]) =>
  points.length < 2
    ? 0
    : Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

const signed = (v: number) => (v > 0 ? `+${v}` : String(v));
const decimal = (v: number, digits: number) =>
  v.toFixed(digits).replace(".", ",");

// ---------------------------------------------------------------------------

type Props = {
  source: Blob;
  /** Reopen with a previous session's crop and colours. */
  initialState?: EditorState;
  onCancel: () => void;
  onDone: (result: { image: CroppedImage; state: EditorState }) => void;
};

export function ImageEditor({ source, initialState, onCancel, onDone }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<EditorState>(initialState ?? INITIAL_STATE);
  /** Mirror of `state` that event handlers read synchronously — pointer
   * events can arrive faster than React re-renders. */
  const stateRef = useRef(state);

  const [tab, setTab] = useState<"crop" | "color">("crop");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [interacting, setInteracting] = useState(false);
  const [straightening, setStraightening] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [redraw, setRedraw] = useState(0);

  const full = useRef<Raster | null>(null);
  const previews = useRef<{ large: HTMLCanvasElement; small: HTMLCanvasElement } | null>(null);
  const adjusted = useRef({
    small: null as HTMLCanvasElement | null,
    smallKey: "",
    large: null as HTMLCanvasElement | null,
    largeKey: "",
  });
  const autoValues = useRef<Adjustments>(NEUTRAL);
  const frameRef = useRef<Frame>({ x: 0, y: 0, w: 1, h: 1 });

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    pan: Point;
    zoom: number;
    center: Point;
    distance: number;
  } | null>(null);

  useModal({ open: true, onClose: onCancel, panelRef, locked: working });

  const commit = (next: EditorState) => {
    stateRef.current = next;
    setState(next);
  };

  /** Applies a zoom and pan (screen px), clamped so the frame stays covered. */
  const withView = (panPx: Point, zoom: number, base = stateRef.current): EditorState => {
    const raster = full.current;
    if (!raster) return base;
    const f = frameRef.current;
    const z = clamp(zoom, 1, MAX_ZOOM);
    const theta = angleOf(base);
    const k = coverScale(theta, f, raster.width, raster.height) * z;
    const p = clampPan(panPx, theta, k, raster.width, raster.height, f);
    return { ...base, zoom: z, pan: { x: p.x / f.w, y: p.y / f.h } };
  };

  const panPxOf = (s: EditorState): Point => ({
    x: s.pan.x * frameRef.current.w,
    y: s.pan.y * frameRef.current.h,
  });

  // --- load -----------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    decode(source)
      .then((raster) => {
        if (cancelled) return;
        full.current = raster;
        const large = fitWithin(raster, PREVIEW_LARGE);
        const small = fitWithin(asRaster(large), PREVIEW_SMALL);
        previews.current = { large, small };
        autoValues.current = autoAdjust(small);
        // Re-clamp a restored state against this photo and frame.
        commit(withView(panPxOf(stateRef.current), stateRef.current.zoom));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Cette image n'a pas pu être lue. Essayez une autre photo.");
        }
      });
    return () => {
      cancelled = true;
      const src = full.current?.source;
      if (typeof ImageBitmap !== "undefined" && src instanceof ImageBitmap) {
        src.close();
      }
    };
    // Only `source` matters: everything else read here is a ref, and a new
    // photo is the one thing that should restart decoding.
  }, [source]);

  // --- measure --------------------------------------------------------------

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      frameRef.current = frameFor(width, height);
      setStage({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // --- colour previews ----------------------------------------------------------

  const adjustKey = keyOf(state.adjustments);

  useEffect(() => {
    const p = previews.current;
    if (!loaded || !p) return;
    const a = stateRef.current.adjustments;
    if (isNeutral(a)) {
      setRedraw((n) => n + 1);
      return;
    }
    // The small copy right away, so the slider feels live…
    const cache = adjusted.current;
    cache.small = adjustedCopy(p.small, a, cache.small);
    cache.smallKey = adjustKey;
    setRedraw((n) => n + 1);
    // …the sharp one once the owner pauses.
    const timer = setTimeout(() => {
      cache.large = adjustedCopy(p.large, a, cache.large);
      cache.largeKey = adjustKey;
      setRedraw((n) => n + 1);
    }, 140);
    return () => clearTimeout(timer);
  }, [adjustKey, loaded]);

  // Preset thumbnails: the photo as currently turned, in each style.
  useEffect(() => {
    const p = previews.current;
    if (!loaded || !p) return;
    const { canvas: base, ctx } = makeCanvas(112, 84);
    const theta = (state.quarterTurns * Math.PI) / 2;
    const k = coverScale(theta, { x: 0, y: 0, w: 112, h: 84 }, p.small.width, p.small.height);
    ctx.translate(56, 42);
    ctx.rotate(theta);
    ctx.scale(state.flipped ? -k : k, k);
    ctx.drawImage(p.small, -p.small.width / 2, -p.small.height / 2);

    const next: Record<string, string> = {};
    for (const preset of PRESETS) {
      const values = preset.values === "auto" ? autoValues.current : preset.values;
      const copy = adjustedCopy(base, values, null);
      next[preset.id] = copy.toDataURL("image/jpeg", 0.82);
    }
    setThumbs(next);
  }, [loaded, state.quarterTurns, state.flipped]);

  // --- draw -------------------------------------------------------------------

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas || !stage.w) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const width = Math.round(stage.w * dpr);
      const height = Math.round(stage.h * dpr);
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, stage.w, stage.h);

      const p = previews.current;
      const raster = full.current;
      if (!p || !raster) return;

      const s = stateRef.current;
      const f = frameRef.current;
      const theta = angleOf(s);
      const k = coverScale(theta, f, raster.width, raster.height) * s.zoom;

      const cache = adjusted.current;
      const key = keyOf(s.adjustments);
      const image =
        comparing || isNeutral(s.adjustments)
          ? p.large
          : cache.largeKey === key && cache.large
            ? cache.large
            : cache.smallKey === key && cache.small
              ? cache.small
              : p.large;

      ctx.save();
      ctx.translate(f.x + f.w / 2 + s.pan.x * f.w, f.y + f.h / 2 + s.pan.y * f.h);
      ctx.rotate(theta);
      ctx.scale(s.flipped ? -k : k, k);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, -raster.width / 2, -raster.height / 2, raster.width, raster.height);
      ctx.restore();

      // Everything below sits on top of an arbitrary photo, not a themed
      // surface — hence literal black/white rather than design tokens.

      // Dim what falls outside the crop.
      ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
      ctx.beginPath();
      ctx.rect(0, 0, stage.w, stage.h);
      ctx.rect(f.x, f.y, f.w, f.h);
      ctx.fill("evenodd");

      // Thirds while cropping; a finer grid while straightening, to line
      // up with the edge of a table or plate.
      const divisions = straightening ? 6 : 3;
      ctx.strokeStyle = `rgba(255, 255, 255, ${
        interacting || straightening ? 0.45 : 0.18
      })`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < divisions; i++) {
        const x = Math.round(f.x + (f.w * i) / divisions) + 0.5;
        const y = Math.round(f.y + (f.h * i) / divisions) + 0.5;
        ctx.moveTo(x, f.y);
        ctx.lineTo(x, f.y + f.h);
        ctx.moveTo(f.x, y);
        ctx.lineTo(f.x + f.w, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);

      // Corner brackets.
      const L = Math.min(18, f.w / 8);
      ctx.strokeStyle = "rgba(255, 255, 255, 1)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      const x0 = f.x - 1;
      const y0 = f.y - 1;
      const x1 = f.x + f.w + 1;
      const y1 = f.y + f.h + 1;
      ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0);
      ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L);
      ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1);
      ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L);
      ctx.stroke();
    });
    return () => cancelAnimationFrame(raf);
  }, [state, stage, loaded, redraw, comparing, interacting, straightening]);

  // --- gestures ---------------------------------------------------------------

  const localPoint = (e: { clientX: number; clientY: number }): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return rect
      ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
      : { x: 0, y: 0 };
  };

  /** A stage point relative to the crop frame's centre. */
  const fromFrameCenter = (p: Point): Point => {
    const f = frameRef.current;
    return { x: p.x - (f.x + f.w / 2), y: p.y - (f.y + f.h / 2) };
  };

  /** Zoom to `zoom`, keeping the photo point under `anchor` still. */
  const zoomAround = (anchor: Point, zoom: number, from = stateRef.current) => {
    const target = clamp(zoom, 1, MAX_ZOOM);
    const ratio = target / from.zoom;
    const pan = panPxOf(from);
    const a = fromFrameCenter(anchor);
    commit(
      withView(
        { x: a.x - (a.x - pan.x) * ratio, y: a.y - (a.y - pan.y) * ratio },
        target,
        from
      )
    );
  };

  const beginGesture = () => {
    const points = [...pointers.current.values()];
    gesture.current = {
      pan: panPxOf(stateRef.current),
      zoom: stateRef.current.zoom,
      center: centerOf(points),
      distance: distanceOf(points),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!loaded || working) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, localPoint(e));
    beginGesture();
    setInteracting(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, localPoint(e));
    const g = gesture.current;
    if (!g) return;

    const points = [...pointers.current.values()];
    const center = centerOf(points);
    const moved = { x: center.x - g.center.x, y: center.y - g.center.y };

    if (points.length >= 2 && g.distance > 0) {
      // Pinch: zoom around where the fingers started, and follow them.
      const zoom = clamp((g.zoom * distanceOf(points)) / g.distance, 1, MAX_ZOOM);
      const ratio = zoom / g.zoom;
      const a = fromFrameCenter(g.center);
      commit(
        withView(
          {
            x: a.x - (a.x - g.pan.x) * ratio + moved.x,
            y: a.y - (a.y - g.pan.y) * ratio + moved.y,
          },
          zoom
        )
      );
    } else {
      commit(withView({ x: g.pan.x + moved.x, y: g.pan.y + moved.y }, g.zoom));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    // Re-baseline so lifting one finger of a pinch doesn't make the image jump.
    if (pointers.current.size > 0) {
      beginGesture();
    } else {
      gesture.current = null;
      setInteracting(false);
    }
  };

  // Wheel / trackpad pinch. Bound natively: React's onWheel is passive, so
  // it can't stop the page behind the editor from scrolling.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!full.current) return;
      const s = stateRef.current;
      zoomAround(localPoint(e), s.zoom * Math.exp(-e.deltaY * 0.0022), s);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
    // Bound once: the handler reads everything through refs.
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const step = e.shiftKey ? 40 : 10;
    const pan = panPxOf(s);
    const moves: Record<string, Point> = {
      ArrowLeft: { x: pan.x - step, y: pan.y },
      ArrowRight: { x: pan.x + step, y: pan.y },
      ArrowUp: { x: pan.x, y: pan.y - step },
      ArrowDown: { x: pan.x, y: pan.y + step },
    };
    const f = frameRef.current;
    const middle = { x: f.x + f.w / 2, y: f.y + f.h / 2 };
    if (moves[e.key]) {
      e.preventDefault();
      commit(withView(moves[e.key], s.zoom));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomAround(middle, s.zoom * 1.15);
    } else if (e.key === "-") {
      e.preventDefault();
      zoomAround(middle, s.zoom / 1.15);
    }
  };

  // --- tools ------------------------------------------------------------------

  /** Quarter turn. The pan turns with the photo, so the same detail stays
   * in the frame. */
  function rotate(direction: 1 | -1) {
    const s = stateRef.current;
    const pan = panPxOf(s);
    const turned = direction === 1 ? { x: -pan.y, y: pan.x } : { x: pan.y, y: -pan.x };
    commit(
      withView(turned, s.zoom, {
        ...s,
        quarterTurns: (s.quarterTurns + direction + 4) % 4,
      })
    );
  }

  /** Mirror what is on screen, left to right. The flip is stored in the
   * photo's own axes, so mirroring the view also negates the rotation. */
  function flip() {
    const s = stateRef.current;
    const pan = panPxOf(s);
    commit(
      withView({ x: -pan.x, y: pan.y }, s.zoom, {
        ...s,
        flipped: !s.flipped,
        quarterTurns: (4 - s.quarterTurns) % 4,
        straighten: -s.straighten,
      })
    );
  }

  function setStraighten(value: number) {
    const s = stateRef.current;
    commit(withView(panPxOf(s), s.zoom, { ...s, straighten: value }));
  }

  function resetGeometry() {
    const s = stateRef.current;
    commit({ ...INITIAL_STATE, adjustments: s.adjustments });
  }

  function setAdjustments(adjustments: Adjustments) {
    commit({ ...stateRef.current, adjustments });
  }

  const presetValues = (preset: Preset) =>
    preset.values === "auto" ? autoValues.current : preset.values;
  const activePreset = PRESETS.find(
    (preset) => keyOf(presetValues(preset)) === adjustKey
  )?.id;

  // --- export -----------------------------------------------------------------

  async function apply() {
    const raster = full.current;
    if (!raster || working) return;
    setWorking(true);
    setError(null);
    // Let the spinner paint before the heavy synchronous work below.
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      const s = stateRef.current;
      const f = frameRef.current;
      const theta = angleOf(s);
      const k = coverScale(theta, f, raster.width, raster.height) * s.zoom;
      const toOutput = OUTPUT_WIDTH / f.w;
      // Source pixels → output pixels. Far below 1:2, pre-shrink the photo
      // first for the same reason `scaleTo` steps.
      const effective = k * toOutput;
      const src =
        effective < 0.5
          ? scaleTo(raster, raster.width * effective * 2, raster.height * effective * 2)
          : raster.source;

      const { canvas, ctx } = makeCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
      // Flatten onto white: JPEG has no alpha, and a transparent PNG would
      // otherwise composite to black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(toOutput, 0, 0, toOutput, 0, 0);
      ctx.translate(f.w / 2 + s.pan.x * f.w, f.h / 2 + s.pan.y * f.h);
      ctx.rotate(theta);
      ctx.scale(s.flipped ? -k : k, k);
      ctx.drawImage(src, -raster.width / 2, -raster.height / 2, raster.width, raster.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      applyAdjustments(ctx, canvas.width, canvas.height, s.adjustments);

      const image = await encode(canvas);
      onDone({ image, state: s });
    } catch {
      setError("Le traitement a échoué. Réessayez avec une autre photo.");
      setWorking(false);
    }
  }

  // --- render -------------------------------------------------------------------

  const toolButton =
    "flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-[11.5px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg active:scale-[0.97] disabled:opacity-40 touch-manipulation";

  const geometryTouched =
    state.quarterTurns !== 0 ||
    state.straighten !== 0 ||
    state.zoom !== 1 ||
    state.flipped ||
    state.pan.x !== 0 ||
    state.pan.y !== 0;

  return (
    <Portal>
      {/* data-theme="dark": photos are judged on a neutral dark surround,
        * whatever theme the dashboard is in. */}
      <div
        data-theme="dark"
        className="fixed inset-0 z-[100] flex items-stretch justify-center md:items-center md:p-6"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden animate-admin-fade bg-app/85 backdrop-blur-sm md:block"
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative flex h-full w-full animate-admin-fade flex-col bg-app text-fg focus:outline-none md:h-[min(780px,100%)] md:max-w-[1100px] md:animate-admin-pop md:flex-row md:overflow-hidden md:rounded-2xl md:border md:border-line md:shadow-admin-lg"
        >
          {/* ---- phone header: title + close. Annuler / Appliquer live at
           * the bottom, under the thumb, as in the iPhone Photos app. ---- */}
          <header className="flex flex-shrink-0 items-center justify-between gap-2 pe-2 ps-4 pt-[env(safe-area-inset-top)] md:hidden">
            <h2 id={titleId} className="py-3 text-[15px] font-semibold tracking-tight">
              Modifier la photo
            </h2>
            <button
              type="button"
              onClick={onCancel}
              disabled={working}
              aria-label="Fermer sans enregistrer"
              className={iconButtonClass("md")}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          {/* ---- stage ---- */}
          <div ref={stageRef} className="relative min-h-0 flex-1 bg-app">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="img"
              aria-label="Aperçu du recadrage. Flèches pour déplacer, plus et moins pour zoomer."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={(e) =>
                zoomAround(localPoint(e), stateRef.current.zoom > 1.4 ? 1 : 2)
              }
              onKeyDown={onKeyDown}
              className={`absolute inset-0 h-full w-full touch-none select-none focus-visible:outline-offset-[-4px] ${
                loaded ? (interacting ? "cursor-grabbing" : "cursor-grab") : ""
              }`}
            />

            {!loaded && !error && (
              <div className="absolute inset-0 grid place-items-center text-muted">
                <span className="flex items-center gap-2.5 text-[13px]">
                  <Spinner className="h-5 w-5" />
                  Ouverture de la photo…
                </span>
              </div>
            )}

            {working && (
              <div className="absolute inset-0 grid animate-admin-fade place-items-center bg-app/60 backdrop-blur-[2px]">
                <span className="flex items-center gap-2.5 rounded-full bg-surface-overlay px-4 py-2 text-[13px] font-medium shadow-admin-md">
                  <Spinner className="h-4 w-4" />
                  Traitement de la photo…
                </span>
              </div>
            )}

            {loaded && tab === "color" && (
              <button
                type="button"
                onPointerDown={() => setComparing(true)}
                onPointerUp={() => setComparing(false)}
                onPointerLeave={() => setComparing(false)}
                onPointerCancel={() => setComparing(false)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") setComparing(true);
                }}
                onKeyUp={() => setComparing(false)}
                onContextMenu={(e) => e.preventDefault()}
                aria-pressed={comparing}
                className="absolute bottom-3 end-3 inline-flex h-9 touch-none select-none items-center gap-2 rounded-full bg-surface-overlay/90 px-3.5 text-[12.5px] font-medium text-fg shadow-admin-md backdrop-blur transition-colors hover:bg-surface-overlay"
              >
                <CompareIcon className="h-4 w-4" />
                {comparing ? "Original" : "Maintenir pour comparer"}
              </button>
            )}
          </div>

          {/* ---- tools ---- */}
          <aside className="flex max-h-[56%] flex-shrink-0 flex-col border-t border-line-soft bg-surface md:max-h-none md:w-[340px] md:border-s md:border-t-0">
            <div className="hidden items-center justify-between gap-3 px-5 pt-5 md:flex">
              <h2 className="text-[16px] font-semibold tracking-tight">
                Modifier la photo
              </h2>
              <button
                type="button"
                onClick={onCancel}
                disabled={working}
                aria-label="Fermer sans enregistrer"
                className={iconButtonClass("sm", "-me-1.5")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 pt-3 md:px-5 md:pt-4">
              <Segmented
                label="Outil"
                fullWidth
                value={tab}
                onChange={setTab}
                options={[
                  { value: "crop", label: "Recadrer", icon: <CropIcon className="h-4 w-4" /> },
                  { value: "color", label: "Couleurs", icon: <SlidersIcon className="h-4 w-4" /> },
                ]}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-4 md:px-5">
              {tab === "crop" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-1">
                    <button type="button" onClick={() => rotate(-1)} disabled={!loaded} aria-label="Pivoter à gauche" className={toolButton}>
                      <RotateLeftIcon className="h-5 w-5" />
                      Gauche
                    </button>
                    <button type="button" onClick={() => rotate(1)} disabled={!loaded} aria-label="Pivoter à droite" className={toolButton}>
                      <RotateRightIcon className="h-5 w-5" />
                      Droite
                    </button>
                    <button type="button" onClick={flip} disabled={!loaded} aria-pressed={state.flipped} className={toolButton}>
                      <FlipIcon className="h-5 w-5" />
                      Miroir
                    </button>
                    <button type="button" onClick={resetGeometry} disabled={!loaded || !geometryTouched} className={toolButton}>
                      <ResetIcon className="h-5 w-5" />
                      Réinitialiser
                    </button>
                  </div>

                  <Slider
                    label="Redresser"
                    min={-45}
                    max={45}
                    step={0.5}
                    origin={0}
                    resetValue={0}
                    value={state.straighten}
                    onChange={setStraighten}
                    onStart={() => setStraightening(true)}
                    onCommit={() => setStraightening(false)}
                    format={(v) => `${v > 0 ? "+" : ""}${decimal(v, 1)}°`}
                    disabled={!loaded}
                  />
                  <Slider
                    label="Zoom"
                    min={1}
                    max={MAX_ZOOM}
                    step={0.01}
                    resetValue={1}
                    value={state.zoom}
                    onChange={(z) => {
                      const f = frameRef.current;
                      zoomAround({ x: f.x + f.w / 2, y: f.y + f.h / 2 }, z);
                    }}
                    format={(v) => `${decimal(v, 1)}×`}
                    disabled={!loaded}
                  />

                  <p className="text-[12px] leading-relaxed text-subtle">
                    {/* Touch screens pinch; mice scroll. */}
                    <span className="[@media(pointer:coarse)]:hidden">
                      Faites glisser la photo pour la cadrer, molette pour
                      zoomer, double-clic pour agrandir.
                    </span>
                    <span className="hidden [@media(pointer:coarse)]:inline">
                      Faites glisser la photo pour la cadrer, pincez avec deux
                      doigts pour zoomer.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[13px] font-medium">Styles</p>
                    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:gap-2 md:px-0">
                      {PRESETS.map((preset) => {
                        const active = activePreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setAdjustments(presetValues(preset))}
                            disabled={!loaded}
                            aria-pressed={active}
                            className="group flex w-[72px] flex-shrink-0 touch-manipulation flex-col items-center gap-1.5 md:w-auto"
                          >
                            <span
                              className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-2 ring-2 transition-[box-shadow] ${
                                active ? "ring-accent" : "ring-transparent group-hover:ring-line"
                              }`}
                            >
                              {thumbs[preset.id] && (
                                /* Plain <img>: a data: URL built in the browser,
                                 * nothing for next/image to optimise. */
                                <img src={thumbs[preset.id]} alt="" className="h-full w-full object-cover" />
                              )}
                              {preset.id === "auto" && (
                                <span className="absolute end-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-app/70 text-accent-strong">
                                  <SparkleIcon className="h-3 w-3" />
                                </span>
                              )}
                            </span>
                            <span
                              className={`text-[11.5px] font-medium ${
                                active ? "text-accent-strong" : "text-muted"
                              }`}
                            >
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(
                    [
                      ["brightness", "Luminosité"],
                      ["contrast", "Contraste"],
                      ["saturation", "Saturation"],
                      ["warmth", "Chaleur"],
                    ] as const
                  ).map(([key, label]) => (
                    <Slider
                      key={key}
                      label={label}
                      min={-100}
                      max={100}
                      origin={0}
                      resetValue={0}
                      value={state.adjustments[key]}
                      onChange={(v) =>
                        setAdjustments({ ...stateRef.current.adjustments, [key]: v })
                      }
                      format={signed}
                      disabled={!loaded}
                    />
                  ))}
                </div>
              )}

              {error && (
                <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-shrink-0 flex-col gap-3 border-t border-line-soft px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:p-4">
              <p className="hidden text-[11.5px] text-subtle md:block">
                Enregistrée en {OUTPUT_WIDTH} × {OUTPUT_HEIGHT} px, au format 4:3
                des photos de la carte.
              </p>
              <div className="flex gap-2.5">
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  disabled={working}
                  className="h-12 flex-1 md:h-10"
                >
                  Annuler
                </Button>
                <Button
                  onClick={apply}
                  loading={working}
                  disabled={!loaded}
                  className="h-12 flex-[1.4] md:h-10 md:flex-1"
                >
                  {working ? "Traitement…" : "Appliquer"}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Portal>
  );
}
