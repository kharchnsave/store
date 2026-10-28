# Kharch n Save storefront

Online store for **Kharch n Save** (*Style Zyada. Kharch Kam.*), a Pakistani shop selling
pre-loved men's and women's shoes and brand-new kids' shoes. China-branded shoes and
clothing are shown as "coming soon" and can't be bought.

Built with Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19 and
Tailwind CSS 4.

> **Demo status:** the catalogue is read from Supabase but currently holds development
> fixtures with temporary stock photos, the cart is stored in the browser, and checkout
> isn't connected. No payments are taken and no
> orders are created. Search engines are asked not to index the site (`robots` in
> `app/layout.tsx`) until it goes live.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

The storefront reads its catalogue from Supabase, so it needs `.env.local` first: see
[Supabase setup](#supabase-setup). Without it, pages that list products show an error
(there is no built-in sample data). `npm run build` also reads the catalogue, to
prerender pages.

Other scripts:

```bash
npm run lint       # ESLint
npm run build      # production build (also type-checks)
npm start          # serve the production build
```

## What's included

| Route | Purpose |
| --- | --- |
| `/` | Homepage: Men/Women/Kids shortcuts, hero, Fresh Finds tabs, EU size shortcuts, kids' banner, guides, coming-soon teasers |
| `/shop` | Catalogue with search, filters (category, new/pre-loved, size, price, brand, condition, style, availability) and sorting. All state lives in the URL, e.g. `/shop?category=women&size=38&sort=price-asc` |
| `/products/[slug]` | Product page: gallery, size selection, stock status, condition notes, add to cart |
| `/cart`, `/checkout` | Full cart and the demo checkout hand-off |
| `/size-guide`, `/condition-guide`, `/delivery-returns` | Help pages |
| `/coming-soon`, `/about`, `/account` | Supporting pages |
| `/admin/login`, `/admin` | Staff sign-in and the admin landing page (see [Admin area](#admin-area)) |

### Code layout

```
app/                    routes, layout, global styles and brand tokens (globals.css)
components/
  layout/               announcement bar, header, mobile menu, search, footer
  home/                 homepage sections
  catalogue/            filters, sorting, URL state, results
  product/              product card, gallery, purchase panel, badges
  cart/                 cart provider, drawer, lines, cart page, checkout hand-off
  ui/drawer.tsx         accessible side drawer (native <dialog>)
  admin/                login form, sign-out button
lib/
  auth/                 admin access check (admin.ts), safe post-login paths
  catalog/              types, labels, Supabase catalogue reads, search/filters, URL query parsing
  cart/                 localStorage-backed cart store, availability types
  supabase/             config.ts (settings), server.ts (anonymous catalogue client),
                        session.ts (per-request signed-in client for /admin)
proxy.ts                refreshes admin sessions; runs on /admin only
  sizes.ts              EU/UK/US size tables
  site.ts               navigation and site copy
scripts/
  verify-catalogue.mjs  `npm run db:verify`: checks the Supabase catalogue with the public key
supabase/
  migrations/           database schema, applied in filename order
  seeds/                development fixtures (never for production)
  setup/                owner-run SQL templates (placeholders only)
  tests/                SQL tests for constraints and permissions
```

## Inventory model

- Each **pre-loved** pair is its own product with one variant (one EU size) and stock `1`
  (or `0` once sold). The cart won't allow more than one.
- **New** kids' styles have one variant per size, each with its own stock count. The
  cart caps quantity at the stock for that size.
- Prices are shown in rupees, e.g. `Rs. 8,500`. The database stores integer **paisa**
  (`price_paisa`, Rs. 8,500 = `850000`); `lib/catalog/supabase-catalog.ts` divides by 100
  once, and everything after it (`Product.price`, the cart) works in rupees.

### Catalogue data

Pages read products only through the async functions in `lib/catalog/catalog.ts`
(`getAllProducts`, `getProductBySlug`, `searchCatalog`, …). They load the published
catalogue from Supabase in `lib/catalog/supabase-catalog.ts`, on the server, with the
publishable key, so row-level security limits it to published products. Search, filters
and sorting then run over that list, which suits hundreds of products; a much larger
catalogue should move filtering into SQL (and past Supabase's 1,000-row default limit).

- **Freshness:** the catalogue query is cached with the `minutes` profile and tagged
  `catalogue`. Pages are prerendered at build time, then refreshed in the background at
  most once a minute while they get visits; after an hour without visits the next request
  waits for fresh data. Browsers may reuse a page for up to 5 minutes. After editing
  products, changes appear within about a minute (or immediately, once an admin action
  calls `revalidateTag("catalogue")`).
- **Failures:** the Supabase client retries a failed read up to 3 times (about 7 seconds
  in total). If Supabase still can't be reached, product sections show "We couldn't load
  these shoes" with a retry button and other pages show an error page. There is no
  fallback data. Pages already cached keep serving their last good version while the
  background refresh fails. A build fails if the catalogue can't be read.
- **Incomplete products:** a published product without at least one photo and one size
  is left out of the storefront, with a warning in the server log.
- **Cart:** lines are saved in the browser as snapshots. The cart re-checks them against
  the catalogue (`/api/cart/availability`) and marks lines that are sold out or no longer
  listed, such as ones saved from the old demo catalogue; those are left out of the
  subtotal. Cart prices and stock are display only: checkout must re-check them on the
  server.

Product photos go in `public/images/products/`. Record the source of any new third-party
images in `ASSET-SOURCES.md`.

## Backend: Supabase

**Decision:** Kharch n Save uses a custom ecommerce backend on **Supabase** (PostgreSQL)
instead of Shopify. Products, stock, carts and orders will live in our own database,
and the storefront will read them through `lib/supabase/server.ts`.

**Status:** the storefront reads its catalogue from Supabase (see
[Catalogue data](#catalogue-data) and [Catalogue database](#catalogue-database)), and
staff can sign in to an admin area that so far only shows a welcome page (see
[Admin area](#admin-area)). Product editing, carts, orders and checkout are not built yet.
The development project is `kharchnsave-dev`.

### Supabase setup

1. Copy the template: `cp .env.example .env.local`
2. In the `kharchnsave-dev` dashboard, open **Connect** (or **Project Settings → API
   Keys**) and copy the **project URL** and the **publishable key** (`sb_publishable_…`)
   into `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. Restart `npm run dev`. Re-run `npm run build` after changing these values: Next.js
   writes `NEXT_PUBLIC_` values into the build.

Notes:

- `.env.local` is git-ignored; only `.env.example` (placeholders) is committed.
- The publishable key is safe to expose in a browser. It can only read or write what the
  database's row-level security (RLS) policies allow, so every table needs RLS enabled
  with policies before the storefront reads it.
- Never put a **secret** or **service-role** key, or the database password, in a
  `NEXT_PUBLIC_` variable. None is needed yet.
- Server code gets the client with `getSupabase()`. It throws a clear error if the
  variables are missing, but importing the module never does, so the demo storefront
  runs without them. `isSupabaseConfigured()` reports whether both are set.

### Catalogue database

| File | Purpose |
| --- | --- |
| `supabase/migrations/20261027120000_create_catalogue.sql` | Tables `products`, `product_variants`, `product_images`, their rules, indexes and access policies |
| `supabase/seeds/dev_catalogue_fixtures.sql` | **Development only.** Four sample products (3 published, 1 draft) from the demo catalogue |
| `supabase/tests/catalogue_test.sql` | Tests for the data rules and for what the public can read and write. Rolls back; leaves nothing behind |
| `scripts/verify-catalogue.mjs` | `npm run db:verify`: checks the fixtures through the API using the publishable key |

What the schema enforces:

- **Pre-loved pairs:** at most one size, with stock 0 or 1, also when a product or size
  is edited later. New products (kids) can have many sizes and any stock of 0 or more.
- **Valid data:** no negative prices or stock; EU sizes 15–50 in whole or half sizes;
  known departments, styles and condition grades; unique slugs, item codes and SKUs;
  `new` items are always condition "new". Published products need a listing date.
- **Publication** (`draft` / `published` / `archived`) is separate from **item status**
  (`new` / `preloved`). Only published products, and their sizes and photos, are visible.
- **Access:** RLS is enabled on all three tables. Visitors and signed-in users can only
  read; nobody can insert, update or delete through the API. Signing in gives no extra
  rights. Catalogue edits happen in the dashboard (as the database owner) until an
  admin flow exists.
- **Photos** can be marked `shows_defect` for close-ups of wear on pre-loved pairs.

#### Applying it to `kharchnsave-dev` (SQL Editor)

1. Open the `kharchnsave-dev` project in the Supabase dashboard and choose **SQL Editor**
   → **New query**.
2. Open `supabase/migrations/20261027120000_create_catalogue.sql` in your editor, copy
   all of it, paste it into the query and click **Run**. Expect "Success. No rows
   returned". It runs as one unit: if anything fails, nothing is created. Running it a
   second time fails with "relation already exists", which is harmless.
3. New query: paste `supabase/seeds/dev_catalogue_fixtures.sql` and **Run**. You can rerun
   it at any time to reset the four fixtures; other products are never touched.
4. New query: paste `supabase/tests/catalogue_test.sql` and **Run**. Success means every
   test passed. A failure stops with a message starting `FAIL`, naming the test. The
   script rolls back, so it leaves no test data behind.
5. In a terminal in the project folder: `npm run db:verify`. Expect
   `All 27 checks passed.`

`npm run db:verify` uses the publishable key only, so it sees what shoppers see. It
proves the published fixtures are readable and the draft is not, and that the API
refuses writes (its write attempts match no rows, so they cannot change anything). It
cannot tell a hidden draft from a missing one, which is why it only counts the draft as
hidden after it has found the published fixtures, and why the SQL tests also exist.

Notes:

- If you later use the Supabase CLI (`supabase db push`), first record the migration as
  already applied: `supabase migration repair --status applied 20261027120000`.
- Remove the fixtures with `delete from public.products where slug like 'dev-%';` (sizes
  and photos are deleted with them). Never run the seed on a production project.

## Admin area

`/admin/login` signs staff in with email and password (Supabase Auth, cookie sessions
via `@supabase/ssr`). `/admin` is a protected landing page with a welcome message and
**Sign out**. There is no public sign-up screen and no product editing yet.

How access is decided:

- **Signing in is not enough.** An account is an admin only if its Supabase Auth user ID
  is listed in `public.admin_members`
  (`supabase/migrations/20261027200000_create_admin_members.sql`). Email addresses and
  user-editable metadata are never used, and nobody becomes an admin automatically.
- **Checked on the server, on every request.** `getAdminAccess()` in `lib/auth/admin.ts`
  verifies the session with Supabase Auth (`getUser()`, so a signed-out or deleted account
  is refused at once; the cookie alone is never trusted), then reads the membership. Every
  admin page must call it, and every future admin Server Action or Route Handler must call
  `requireAdmin()`. Hiding a button or relying on a redirect is not protection.
- **Fails closed.** If Supabase Auth or the membership lookup can't be reached, the admin
  area shows "We couldn't verify your access" and stays locked.
- **Memberships are owner-only.** RLS is enabled; visitors can't read the table, a
  signed-in user can read only their own row, and nobody can add, change or remove rows
  through the API. The owner manages them in the SQL Editor.
- **Sessions:** `proxy.ts` (on `/admin` paths only) refreshes expiring sessions and marks
  admin responses `private, no-store`. The session cookies are HttpOnly, `SameSite=Lax` and
  limited to `/admin`, so storefront pages never receive them and stay cacheable. The
  signed-in client (`lib/supabase/session.ts`) is created per request and is separate from
  the anonymous catalogue client; nothing signed-in is cached.
- After sign-in, people are only ever sent to a page inside `/admin` (`safeAdminPath`).

> **Before enabling product editing:** require multi-factor authentication (MFA) for
> admins. Enrol each admin in an authenticator app (TOTP), check for an `aal2` session in
> `requireAdmin()`, and make every write policy require both membership and
> `(select auth.jwt() ->> 'aal') = 'aal2'`. Password-only admin accounts must not be able
> to change products.

### Making yourself an admin (one-time owner setup)

Do these in order, in the `kharchnsave-dev` dashboard:

1. **Create the membership table.** SQL Editor → New query → paste all of
   `supabase/migrations/20261027200000_create_admin_members.sql` → **Run**. Expect
   "Success. No rows returned".
2. **Check it (optional, recommended).** New query → paste
   `supabase/tests/admin_members_test.sql` → **Run**. Success means every test passed. It
   uses three temporary test users and rolls everything back.
3. **Create your login.** Authentication → Users → **Add user** → **Create new user**.
   Enter your email and a long, unique password (a password manager helps), tick
   **Auto Confirm User**, and create it.
4. **Copy your user ID.** Click your new user and copy its **User UID** (a long code like
   `1a2b3c4d-…`).
5. **Make that user an admin.** New query → paste
   `supabase/setup/grant_admin_TEMPLATE.sql` → replace `PASTE-USER-UID-HERE` in the
   `insert` line with your User UID (keep the quotes) → **Run**. Don't save your real UID
   into the file in the project.
6. **Sign in.** Run `npm run dev`, open <http://localhost:3000/admin/login> and sign in.
   You should see "Welcome, *your email*".

To remove someone's access, run the `delete` line at the bottom of the template with their
User UID; their next page load is refused. Password resets for staff are done in
Authentication → Users for now.

Recommended (not changed by this project): in Authentication's sign-up settings, turn off
"Allow new users to sign up" so accounts can only be created by you. Self-registered
accounts would still not be admins, but there is no reason to allow them.

If you later use the Supabase CLI, record this migration as applied first:
`supabase migration repair --status applied 20261027200000`.

### Verification status

**Confirmed by hand against `kharchnsave-dev` (real Supabase Auth and database):**

- The approved admin signs in and reaches the welcome page.
- Refreshing `/admin` works, with no rendering error.
- Signing out, then signing back in, works.
- A separate signed-in account without an `admin_members` row is refused access.

**Automated checks against `kharchnsave-dev` (no users created, nothing written):**
signed-out visits redirect to the login page with `no-store`, wrong credentials get the
generic error and no session cookie, forged or garbage cookies are refused, unsafe return
paths are replaced, and storefront pages set no cookies and stay cacheable.

**Still pending on the hosted project:**

- Session-expiry refresh (an access token expiring and being refreshed by `proxy.ts`
  while the admin stays signed in).
- Membership removal (deleting an admin's `admin_members` row, then confirming their next
  page load is refused).

Both behave correctly against a local stand-in for Supabase Auth and the REST API, but
that is a mock and does not prove how the hosted project behaves.

## Enabling real checkout

No payment provider is configured in this project, so the cart is a clearly labelled demo
and `/checkout` explains that ordering isn't available yet. There is no payment form and
no fake order confirmation.

To take real orders you'll need:

1. **Catalogue tables in Supabase**, prepared in `supabase/migrations/` (see above), and
   real listings in them. An admin way to add and edit products is still to be built.
2. **Code changes:**
   - Reimplement `lib/catalog/catalog.ts` with Supabase queries.
   - Replace `lib/cart/cart-store.ts` with a server-side cart and order flow so stock
     and prices are re-checked, and unique pairs reserved, on the server.
   - Remove the demo notices (`DemoCheckoutNote`, the product-page sample notice, the
     footer note) and the `robots` noindex rule.
3. **Payments:** integrate a payment option that works in Pakistan (for example a local
   gateway, or cash on delivery if you offer it).
4. **Order emails, delivery charges and customer accounts**, which Supabase doesn't
   provide out of the box.

## Before launch

- [ ] Real product photos and listings in place of the demo catalogue
- [ ] Delivery areas, charges and timelines (`/delivery-returns`)
- [ ] Returns and exchange policy for pre-loved and new items
- [ ] Payment methods offered
- [ ] Contact details (phone, WhatsApp, email, address) for the footer
- [ ] Confirm the condition grades in `lib/catalog/labels.ts` match how stock is graded
- [ ] Confirm rights to the supplied hero and department shoe images (they show Nike and
      ASICS sneakers)
- [ ] Domain, and `metadataBase` for share images
- [ ] Production Supabase project and its environment variables on the host
- [ ] MFA required for admin accounts before product editing is enabled
# store
