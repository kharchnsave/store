-- =============================================================================
-- DEVELOPMENT FIXTURES ONLY. Do not run against a production database.
-- =============================================================================
--
-- Sample catalogue rows for kharchnsave-dev, reusing listings and photo paths
-- from the storefront's former built-in demo catalogue. They exist to test
-- the database and its access rules, and are what `npm run db:verify` expects:
--
--   dev-nike-air-max-white-orange-eu43        published  men     pre-loved  1 size
--   dev-new-balance-x90-pink-grey-eu38        published  women   pre-loved  1 size
--   dev-baby-canvas-sneakers-teal-print       published  kids    new        4 sizes
--   dev-draft-nike-air-force-1-low-black-eu42 DRAFT      men     pre-loved  1 size
--
-- The draft must never be visible through the public (publishable) key.
--
-- Safe to rerun: fixtures are matched by their dev- slug, DEV- SKU and photo
-- position, and only those rows are reset to the values below. Other products
-- are never modified. Prices are in paisa (Rs. 8,500 = 850000).
--
-- To remove the fixtures later:
--   delete from public.products where slug like 'dev-%';   -- cascades to sizes and photos

begin;

insert into public.products (
  item_code, slug, name, brand, department, styles, item_status, condition,
  condition_notes, colour, description, price_paisa, publication_status, listed_at
)
values
  (
    'DEV-PL-M-1001',
    'dev-nike-air-max-white-orange-eu43',
    'Air Max Sneakers — White/Orange',
    'Nike',
    'men',
    array['sneakers', 'casual'],
    'preloved',
    'excellent',
    array[
      'Clean uppers with very light creasing across the toe',
      'Visible Air unit intact, no yellowing',
      'Outsole tread shows minimal wear'
    ],
    'White/Orange',
    'A bright, easy-to-wear Air Max in white with orange accents. Comfortable cushioning for all-day wear.',
    850000,
    'published',
    '2026-10-22'
  ),
  (
    'DEV-PL-W-2001',
    'dev-new-balance-x90-pink-grey-eu38',
    'X-90 — Pink/Grey',
    'New Balance',
    'women',
    array['sneakers', 'casual'],
    'preloved',
    'excellent',
    array[
      'Mesh and suede panels clean',
      'Very light creasing on the toe',
      'Midsole bright with minimal marks'
    ],
    'Pink/Grey',
    'Soft pink and grey New Balance lifestyle sneaker with a cushioned sole. Light and comfortable for daily wear.',
    690000,
    'published',
    '2026-10-23'
  ),
  (
    'DEV-NW-K-3001',
    'dev-baby-canvas-sneakers-teal-print',
    'Baby Canvas Sneakers — Teal Print',
    'Unbranded',
    'kids',
    array['sneakers', 'casual'],
    'new',
    'new',
    array[]::text[],
    'Teal',
    'Soft canvas first-walker sneakers in a teal print, with easy laces and a flexible sole.',
    245000,
    'published',
    '2026-10-19'
  ),
  (
    'DEV-PL-M-1002',
    'dev-draft-nike-air-force-1-low-black-eu42',
    'Air Force 1 Low — Black',
    'Nike',
    'men',
    array['sneakers', 'casual'],
    'preloved',
    'very-good',
    array[
      'Light creasing on the toe box',
      'Small scuffs along the midsole edge',
      'Outsole tread in good shape'
    ],
    'Black/White',
    'All-black leather Air Force 1 with a white Swoosh. A versatile low-top that works with almost anything.',
    950000,
    'draft',
    null
  )
on conflict (slug) do update set
  item_code = excluded.item_code,
  name = excluded.name,
  brand = excluded.brand,
  department = excluded.department,
  styles = excluded.styles,
  item_status = excluded.item_status,
  condition = excluded.condition,
  condition_notes = excluded.condition_notes,
  colour = excluded.colour,
  description = excluded.description,
  price_paisa = excluded.price_paisa,
  publication_status = excluded.publication_status,
  listed_at = excluded.listed_at;

insert into public.product_variants (product_id, item_status, sku, size_eu, stock)
select p.id, p.item_status, v.sku, v.size_eu, v.stock
from (
  values
    ('dev-nike-air-max-white-orange-eu43', 'DEV-PL-M-1001-43', 43::numeric, 1),
    ('dev-new-balance-x90-pink-grey-eu38', 'DEV-PL-W-2001-38', 38, 1),
    ('dev-baby-canvas-sneakers-teal-print', 'DEV-NW-K-3001-18', 18, 3),
    ('dev-baby-canvas-sneakers-teal-print', 'DEV-NW-K-3001-19', 19, 0),
    ('dev-baby-canvas-sneakers-teal-print', 'DEV-NW-K-3001-20', 20, 2),
    ('dev-baby-canvas-sneakers-teal-print', 'DEV-NW-K-3001-21', 21, 4),
    ('dev-draft-nike-air-force-1-low-black-eu42', 'DEV-PL-M-1002-42', 42, 1)
) as v (slug, sku, size_eu, stock)
join public.products p on p.slug = v.slug
on conflict (sku) do update set
  size_eu = excluded.size_eu,
  stock = excluded.stock
-- Never touch a variant that belongs to some other product.
where product_variants.product_id = excluded.product_id;

insert into public.product_images (product_id, sort_order, src, alt, width, height, focus, shows_defect)
select p.id, i.sort_order, i.src, i.alt, i.width, i.height, i.focus, i.shows_defect
from (
  values
    (
      'dev-nike-air-max-white-orange-eu43', 0,
      '/images/products/nike-air-max-sail-orange-1.jpg',
      'Pre-loved Nike Air Max sneaker in white with orange Swoosh and sole, angled side view',
      1400, 1120, null::text, false
    ),
    (
      'dev-nike-air-max-white-orange-eu43', 1,
      '/images/products/nike-air-max-sail-orange-2.jpg',
      'The same Nike Air Max sneaker from the opposite side, showing the visible Air unit',
      1400, 1120, null, false
    ),
    (
      'dev-new-balance-x90-pink-grey-eu38', 0,
      '/images/products/new-balance-x90-pink.jpg',
      'Pre-loved pink and grey New Balance X-90 sneaker on dark fleece',
      1400, 1000, null, false
    ),
    (
      'dev-baby-canvas-sneakers-teal-print', 0,
      '/images/products/baby-canvas-sneakers-teal-1.jpg',
      'New pair of teal printed baby canvas sneakers on an orange blanket',
      1400, 2100, '50% 48%', false
    ),
    (
      'dev-baby-canvas-sneakers-teal-print', 1,
      '/images/products/baby-canvas-sneakers-teal-2.jpg',
      'Side view of the teal printed baby canvas sneakers showing the sole',
      1400, 2100, '50% 45%', false
    ),
    (
      'dev-draft-nike-air-force-1-low-black-eu42', 0,
      '/images/products/nike-air-force-1-black.jpg',
      'Pre-loved black leather Nike Air Force 1 Low with white Swoosh on a white shelf',
      1400, 1960, '50% 68%', false
    )
) as i (slug, sort_order, src, alt, width, height, focus, shows_defect)
join public.products p on p.slug = i.slug
on conflict (product_id, sort_order) do update set
  src = excluded.src,
  alt = excluded.alt,
  width = excluded.width,
  height = excluded.height,
  focus = excluded.focus,
  shows_defect = excluded.shows_defect;

commit;
