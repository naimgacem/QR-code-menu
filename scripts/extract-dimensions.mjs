#!/usr/bin/env node
/**
 * One-shot helper: walks data/menu.json, fetches each item's image,
 * reads its natural width/height, and writes them back into the JSON.
 *
 * Run after adding new images:
 *   npm run extract-dimensions
 *
 * Already-populated items are skipped (re-run is safe).
 * Pass --force to re-fetch every item.
 */
import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import http from "node:http";

const FILE = path.resolve("data/menu.json");
const FORCE = process.argv.includes("--force");

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const m = buf[i + 1];
    if (
      (m >= 0xc0 && m <= 0xc3) ||
      (m >= 0xc5 && m <= 0xc7) ||
      (m >= 0xc9 && m <= 0xcb) ||
      (m >= 0xcd && m <= 0xcf)
    ) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    if (m === 0xd8 || m === 0xd9) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (!len) return null;
    i += 2 + len;
  }
  return null;
}

function pngSize(buf) {
  if (
    buf[0] !== 0x89 ||
    buf[1] !== 0x50 ||
    buf[2] !== 0x4e ||
    buf[3] !== 0x47
  )
    return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function webpSize(buf) {
  // RIFF....WEBP
  if (
    buf[0] !== 0x52 ||
    buf[1] !== 0x49 ||
    buf[2] !== 0x46 ||
    buf[3] !== 0x46 ||
    buf[8] !== 0x57 ||
    buf[9] !== 0x45 ||
    buf[10] !== 0x42 ||
    buf[11] !== 0x50
  )
    return null;
  // VP8L lossless
  if (
    buf[12] === 0x56 &&
    buf[13] === 0x50 &&
    buf[14] === 0x38 &&
    buf[15] === 0x4c
  ) {
    const b1 = buf.readUInt32LE(21);
    return { w: (b1 & 0x3fff) + 1, h: ((b1 >> 14) & 0x3fff) + 1 };
  }
  // VP8X extended
  if (
    buf[12] === 0x56 &&
    buf[13] === 0x50 &&
    buf[14] === 0x38 &&
    buf[15] === 0x58
  ) {
    return {
      w: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
      h: (buf.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }
  return null;
}

function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("http://") ? http : https;
    const req = lib.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchBuf(res.headers.location));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error("timeout")));
  });
}

async function main() {
  const raw = await fs.readFile(FILE, "utf8");
  const json = JSON.parse(raw);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const cat of json.categories) {
    for (const item of cat.items) {
      if (!item.image) continue;
      if (!FORCE && item.width && item.height) {
        skipped++;
        continue;
      }
      try {
        const buf = await fetchBuf(item.image);
        const size = jpegSize(buf) || pngSize(buf) || webpSize(buf);
        if (size && size.w && size.h) {
          item.width = size.w;
          item.height = size.h;
          updated++;
          console.log(`  ${item.id.padEnd(22)} ${size.w}×${size.h}`);
        } else {
          failed++;
          console.warn(`  ${item.id.padEnd(22)} could not parse dimensions`);
        }
      } catch (e) {
        failed++;
        console.warn(`  ${item.id.padEnd(22)} fetch failed — ${e.message}`);
      }
    }
  }

  await fs.writeFile(FILE, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`\n${updated} updated · ${skipped} already had dimensions · ${failed} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
