#!/usr/bin/env node
/**
 * One-shot migration: data/menu.json → Supabase.
 *
 * Run once, right after applying supabase/schema.sql:
 *   npm run seed
 *
 * Refuses to run if the tables already contain rows, so an accidental
 * second run can't duplicate or clobber the owner's live edits.
 * Pass --force to wipe both tables first and re-seed from the JSON.
 *
 * Image handling: paths are copied across verbatim. Local /images/menu/...
 * files stay in /public (served from the same origin — faster than a round
 * trip to Supabase Storage) and remote URLs stay remote. Only NEW photos
 * uploaded from the admin dashboard land in Supabase Storage.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const FORCE = process.argv.includes("--force");
const MENU_FILE = path.resolve("data/menu.json");
const ENV_FILE = path.resolve(".env.local");

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const die = (msg) => {
  console.error(`\n${c.red("✗")} ${msg}\n`);
  process.exit(1);
};

/** Minimal .env parser — avoids a dotenv dependency for one script. */
async function loadEnvLocal() {
  let raw;
  try {
    raw = await fs.readFile(ENV_FILE, "utf8");
  } catch {
    return; // fall through to real process.env (e.g. CI)
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

await loadEnvLocal();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  die(
    `Missing credentials.\n\n` +
      `  Add these to ${c.bold(".env.local")}:\n` +
      `    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n` +
      `    SUPABASE_SERVICE_ROLE_KEY=eyJ...\n\n` +
      `  Both are in Supabase Dashboard → Project Settings → API.\n` +
      `  The service role key bypasses RLS — it is only used by this script\n` +
      `  and must never be committed or exposed to the browser.`
  );
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------

const menu = JSON.parse(await fs.readFile(MENU_FILE, "utf8"));
const categories = menu.categories ?? [];

if (!categories.length) die("data/menu.json has no categories.");

const dishCount = categories.reduce((n, cat) => n + (cat.items?.length ?? 0), 0);
console.log(
  `\n${c.bold("Dar El Baraka")} — seeding Supabase\n` +
    c.dim(`  source: data/menu.json (${categories.length} categories, ${dishCount} dishes)`) +
    "\n" +
    c.dim(`  target: ${URL}`) +
    "\n"
);

// --- guard against double-seeding ------------------------------------------

const { count: existingCategories, error: countError } = await supabase
  .from("categories")
  .select("*", { count: "exact", head: true });

if (countError) {
  die(
    `Could not read the categories table:\n    ${countError.message}\n\n` +
      `  Did you run ${c.bold("supabase/schema.sql")} in the SQL Editor first?`
  );
}

if (existingCategories > 0) {
  if (!FORCE) {
    die(
      `The database already has ${existingCategories} categories.\n\n` +
        `  Seeding again would duplicate them. If you really want to replace\n` +
        `  everything currently in Supabase with data/menu.json, re-run with:\n\n` +
        `    ${c.bold("npm run seed -- --force")}\n`
    );
  }
  console.log(c.yellow(`  --force: deleting ${existingCategories} existing categories (dishes cascade)…`));
  const { error } = await supabase
    .from("categories")
    .delete()
    .not("id", "is", null);
  if (error) die(`Wipe failed: ${error.message}`);
}

// --- insert ----------------------------------------------------------------

const loc = (value, key) => value?.[key] ?? null;

let insertedDishes = 0;

for (const [index, category] of categories.entries()) {
  const { data: inserted, error: catError } = await supabase
    .from("categories")
    .insert({
      slug: category.id,
      title_fr: category.title.fr,
      title_en: loc(category.title, "en"),
      title_ar: loc(category.title, "ar"),
      subtitle_fr: loc(category.subtitle, "fr"),
      subtitle_en: loc(category.subtitle, "en"),
      subtitle_ar: loc(category.subtitle, "ar"),
      position: index,
    })
    .select("id")
    .single();

  if (catError) die(`Category "${category.id}" failed: ${catError.message}`);

  const items = category.items ?? [];
  if (items.length) {
    const rows = items.map((item, i) => ({
      category_id: inserted.id,
      slug: item.id,
      name_fr: item.name.fr,
      name_en: loc(item.name, "en"),
      name_ar: loc(item.name, "ar"),
      description_fr: loc(item.description, "fr"),
      description_en: loc(item.description, "en"),
      description_ar: loc(item.description, "ar"),
      price: item.price,
      image_url: item.image ?? null,
      image_width: item.width ?? null,
      image_height: item.height ?? null,
      is_available: true,
      position: i,
    }));

    const { error: dishError } = await supabase.from("dishes").insert(rows);
    if (dishError)
      die(`Dishes for "${category.id}" failed: ${dishError.message}`);
    insertedDishes += rows.length;
  }

  console.log(
    `  ${c.green("✓")} ${category.title.fr} ${c.dim(`(${items.length} dishes)`)}`
  );
}

console.log(
  `\n${c.green("✓")} Seeded ${categories.length} categories and ${insertedDishes} dishes.\n` +
    c.dim("  Next: create the owner's login (Supabase Dashboard → Authentication →\n") +
    c.dim("  Users → Add user), then visit /admin/login.\n")
);
