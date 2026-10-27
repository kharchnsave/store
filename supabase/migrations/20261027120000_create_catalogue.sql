-- Kharch n Save catalogue: products, their sizes (variants) and photos.
--
-- Mirrors the storefront's model in lib/catalog/types.ts, with these differences:
--
-- * Prices are integer PAISA (1 rupee = 100 paisa) in price_paisa. The
--   storefront currently works in WHOLE RUPEES (Product.price), so the data
--   layer must convert (rupees = price_paisa / 100) when it starts reading
--   this table. Nothing in the website uses this table yet.
-- * products.id is a UUID. The human item code shown on product pages
--   (Product.id, e.g. "PL-M-1001") is products.item_code.
-- * item_status (new / pre-loved) and publication_status (draft / published /
--   archived) are separate. Only published products are visible to the public.
-- * Images gain shows_defect, to mark close-ups of wear on pre-loved pairs.
--
-- Access: row-level security (RLS) is enabled on every table. Visitors (anon)
-- and signed-in users (authenticated) can only SELECT, and only published
-- products with their variants and images. Signing in grants nothing extra.
-- No policy allows inserts, updates or deletes; catalogue changes are made by
-- the database owner (SQL editor / migrations) until an admin flow exists.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  item_code text not null unique,
  slug text not null unique,
  name text not null,
  brand text not null,
  department text not null,
  styles text[] not null default '{}',
  item_status text not null,
  condition text not null,
  condition_notes text[] not null default '{}',
  colour text not null,
  description text not null default '',
  price_paisa integer not null,
  publication_status text not null default 'draft',
  listed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_item_code_format check (item_code ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  constraint products_name_not_blank check (btrim(name) <> ''),
  constraint products_brand_not_blank check (btrim(brand) <> ''),
  constraint products_colour_not_blank check (btrim(colour) <> ''),
  constraint products_department_valid check (department in ('men', 'women', 'kids')),
  constraint products_styles_valid check (
    styles <@ array['sneakers', 'running', 'casual', 'formal', 'heels', 'boots', 'sandals']::text[]
  ),
  constraint products_item_status_valid check (item_status in ('new', 'preloved')),
  constraint products_condition_valid check (condition in ('new', 'excellent', 'very-good', 'good')),
  -- Brand-new stock is always condition "new"; pre-loved pairs are graded.
  constraint products_condition_matches_item_status check ((item_status = 'new') = (condition = 'new')),
  constraint products_price_not_negative check (price_paisa >= 0),
  constraint products_publication_status_valid check (publication_status in ('draft', 'published', 'archived')),
  constraint products_published_needs_listing_date check (publication_status <> 'published' or listed_at is not null),
  -- Target of product_variants' composite foreign key (see below).
  constraint products_id_item_status_key unique (id, item_status)
);

comment on table public.products is
  'One row per listing: a single pre-loved pair, or a new style sold in several sizes.';
comment on column public.products.item_code is
  'Human-readable item code shown on product pages, e.g. PL-M-1001 (Product.id in the storefront).';
comment on column public.products.price_paisa is
  'Price in paisa (1 rupee = 100 paisa). The storefront''s Product.price is whole rupees: divide by 100.';
comment on column public.products.item_status is
  'new or preloved. Independent of publication_status.';
comment on column public.products.publication_status is
  'draft and archived rows are hidden from the public; only published rows are readable.';
comment on column public.products.listed_at is
  'Date the listing went live; required once published. Used for "newest" sorting.';

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  -- Copy of products.item_status, kept in sync by the foreign key below
  -- (ON UPDATE CASCADE). It lets ordinary constraints enforce the pre-loved
  -- rules, including when a product's status is changed later.
  item_status text not null,
  sku text not null unique,
  size_eu numeric(3, 1) not null,
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_variants_product_fkey foreign key (product_id, item_status)
    references public.products (id, item_status) on update cascade on delete cascade,
  constraint product_variants_sku_format check (sku ~ '^[A-Z0-9]+([.-][A-Z0-9]+)*$'),
  -- Whole or half EU sizes from baby (15) to large adult (50).
  constraint product_variants_size_valid check (size_eu between 15 and 50 and size_eu * 2 = trunc(size_eu * 2)),
  constraint product_variants_stock_not_negative check (stock >= 0),
  -- A pre-loved pair is unique: stock is 1 while for sale and 0 once sold.
  constraint product_variants_preloved_stock check (item_status <> 'preloved' or stock <= 1),
  constraint product_variants_one_size_per_product unique (product_id, size_eu)
);

-- A pre-loved product is a single pair, so it has at most one variant.
-- A unique index (rather than a trigger) also holds under concurrent inserts.
create unique index product_variants_one_per_preloved_product
  on public.product_variants (product_id)
  where item_status = 'preloved';

comment on table public.product_variants is
  'Purchasable sizes. Pre-loved products have at most one variant with stock 0 or 1; new products can have many.';
comment on column public.product_variants.size_eu is
  'EU size, whole or half (e.g. 42 or 42.5).';

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  src text not null,
  alt text not null,
  width integer not null,
  height integer not null,
  sort_order integer not null default 0,
  focus text,
  shows_defect boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A site path (/images/...) or an https URL; no spaces.
  constraint product_images_src_valid check (src ~ '^(/|https://)[^[:space:]]+$'),
  constraint product_images_alt_not_blank check (btrim(alt) <> ''),
  constraint product_images_dimensions_positive check (width > 0 and height > 0),
  constraint product_images_sort_order_not_negative check (sort_order >= 0),
  constraint product_images_focus_format check (focus is null or focus ~ '^[0-9]{1,3}% [0-9]{1,3}%$'),
  constraint product_images_sort_order_key unique (product_id, sort_order)
);

comment on column public.product_images.src is
  'Image path under public/ (e.g. /images/products/x.jpg) or an https URL.';
comment on column public.product_images.sort_order is
  'Display order; 0 is the main photo.';
comment on column public.product_images.focus is
  'Optional CSS object-position (e.g. "50% 68%") used when the photo is cropped to a square.';
comment on column public.product_images.shows_defect is
  'True for close-ups of wear or flaws on a pre-loved pair.';

-- ---------------------------------------------------------------------------
-- Indexes (foreign keys are already covered by the unique constraints above)
-- ---------------------------------------------------------------------------

create index products_published_listing_idx
  on public.products (department, listed_at desc)
  where publication_status = 'published';

create index products_styles_idx on public.products using gin (styles);

create index product_variants_size_in_stock_idx
  on public.product_variants (size_eu)
  where stock > 0;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Only used by triggers; Supabase would otherwise let API roles execute it.
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------------------

-- Enabled explicitly, whatever the dashboard default is.
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- Supabase grants anon and authenticated full access to new tables in the
-- public schema by default. Reset that to read-only.
revoke all on table public.products, public.product_variants, public.product_images
  from public, anon, authenticated;
grant select on table public.products, public.product_variants, public.product_images
  to anon, authenticated;

create policy "Public can read published products"
  on public.products
  for select
  to anon, authenticated
  using (publication_status = 'published');

create policy "Public can read variants of published products"
  on public.product_variants
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_variants.product_id
        and p.publication_status = 'published'
    )
  );

create policy "Public can read images of published products"
  on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and p.publication_status = 'published'
    )
  );
