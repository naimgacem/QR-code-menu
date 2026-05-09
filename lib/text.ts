export const DIACRITICS_G = /[̀-ͯ]/g;
const DIACRITIC_TEST = /[̀-ͯ]/;

export const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(DIACRITICS_G, "");

export type NormMap = {
  /** lowercased + NFD + diacritic-stripped form of the original text */
  normalized: string;
  /** for each char in `normalized`, the index of the originating char in the original text */
  origIndexFor: number[];
};

export function buildNormMap(text: string): NormMap {
  const lower = text.toLowerCase();
  let normalized = "";
  const origIndexFor: number[] = [];
  for (let i = 0; i < lower.length; i++) {
    const decomposed = lower[i].normalize("NFD");
    for (const ch of decomposed) {
      if (!DIACRITIC_TEST.test(ch)) {
        normalized += ch;
        origIndexFor.push(i);
      }
    }
  }
  return { normalized, origIndexFor };
}

/**
 * Returns ranges in the original text that match `query`, ignoring case + accents.
 * Each range is [startInOriginal, endInOriginal) (end exclusive).
 */
export function findMatches(text: string, query: string): [number, number][] {
  const q = norm(query.trim());
  if (!q) return [];
  const map = buildNormMap(text);
  const ranges: [number, number][] = [];
  let from = 0;
  while (from <= map.normalized.length - q.length) {
    const idx = map.normalized.indexOf(q, from);
    if (idx === -1) break;
    const startOrig = map.origIndexFor[idx];
    const endNormIdx = idx + q.length - 1;
    const endOrig = map.origIndexFor[endNormIdx] + 1;
    ranges.push([startOrig, endOrig]);
    from = idx + q.length;
  }
  return ranges;
}
