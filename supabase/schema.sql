-- ============================================================================
-- Dar El Baraka — menu database schema
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is idempotent: safe to re-run.
--
-- Design notes:
--   * `slug` is the PUBLIC id. The customer menu uses it for DOM anchors
--     (#plats-traditionnels) and for the sessionStorage order state
--     (deb-order maps dish-slug → qty). Changing a slug breaks a customer's
--     in-progress order and any shared deep link, so the admin UI never
--     lets you edit it after creation.
--   * `id` (uuid) is the INTERNAL id — only the admin dashboard uses it.
--   * en/ar columns exist so the dishes migrated from data/menu.json keep
--     their existing translations. The current admin UI only writes the `_fr`
--     columns; the others are preserved untouched.
--   * `position` drives display order. Gaps are fine — we only ever sort by it.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title_fr    text not null,
  title_en    text,
  title_ar    text,
  subtitle_fr text,
  subtitle_en text,
  subtitle_ar text,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint categories_title_fr_not_blank check (length(btrim(title_fr)) > 0)
);

create table if not exists public.dishes (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references public.categories(id) on delete cascade,
  slug           text not null unique,
  name_fr        text not null,
  name_en        text,
  name_ar        text,
  description_fr text,
  description_en text,
  description_ar text,
  -- Algerian dinar, whole units. No sub-dinar pricing exists on this menu.
  price          integer not null,
  -- Either a Supabase Storage public URL, a legacy /images/menu/... path,
  -- or a full remote URL. All three render through next/image.
  image_url      text,
  image_width    integer,
  image_height   integer,
  -- Lets the owner hide a sold-out dish without destroying it (and its photo).
  is_available   boolean not null default true,
  position       integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint dishes_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint dishes_name_fr_not_blank check (length(btrim(name_fr)) > 0),
  constraint dishes_price_non_negative check (price >= 0)
);

create index if not exists dishes_category_id_position_idx
  on public.dishes (category_id, position);

create index if not exists categories_position_idx
  on public.categories (position);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_touch_updated_at on public.categories;
create trigger categories_touch_updated_at
  before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists dishes_touch_updated_at on public.dishes;
create trigger dishes_touch_updated_at
  before update on public.dishes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Anyone (anon key) may READ — that is the public menu.
-- Only an authenticated session may WRITE — that is the owner in /admin.
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.dishes     enable row level security;

drop policy if exists "categories are publicly readable" on public.categories;
create policy "categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories are writable by authenticated users" on public.categories;
create policy "categories are writable by authenticated users"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "dishes are publicly readable" on public.dishes;
create policy "dishes are publicly readable"
  on public.dishes for select
  to anon, authenticated
  using (true);

drop policy if exists "dishes are writable by authenticated users" on public.dishes;
create policy "dishes are writable by authenticated users"
  on public.dishes for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for dish photos
--
-- Public read so next/image can fetch without a signed URL; writes are
-- restricted to an authenticated session.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "menu images are publicly readable" on storage.objects;
create policy "menu images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'menu-images');

drop policy if exists "menu images are uploadable by authenticated users" on storage.objects;
create policy "menu images are uploadable by authenticated users"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-images');

drop policy if exists "menu images are updatable by authenticated users" on storage.objects;
create policy "menu images are updatable by authenticated users"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-images')
  with check (bucket_id = 'menu-images');

drop policy if exists "menu images are deletable by authenticated users" on storage.objects;
create policy "menu images are deletable by authenticated users"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-images');
