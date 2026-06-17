# CLAUDE.md

Guidance for working in this repository.

## Repository layout

This workspace contains three loosely related things:

- **`taiba-dates/`** — the real project: a Next.js 14 (App Router) marketing site + admin
  CMS for "طيبه للتمور / Tiba For Dates", an Arabic-first (RTL) dates retailer. **Almost all
  work happens here.** Run all `npm` commands from inside this folder.
- **`index.html`, `index1.html`** — standalone static HTML mockups/prototypes of the landing
  page. Not part of the Next.js build; kept for reference only.
- **`url2qr.py`** — an unrelated standalone CLI utility that turns URLs into QR-code JPGs
  (`python url2qr.py <url>`). Requires `qrcode` and `Pillow`. Not part of the web app.

Note: this workspace is **not a git repository**.

## Commands (run from `taiba-dates/`)

```bash
npm install      # install deps
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # next lint
```

There is no test suite and no seed script. The first admin user must be created manually
(see "Creating an admin" below).

## Environment variables

Required at runtime (loaded from `.env*`, which is gitignored — never commit secrets):

- `MONGO_URI` — MongoDB connection string ([lib/db.ts](taiba-dates/lib/db.ts))
- `JWT_SECRET` — HMAC secret for signing/verifying the auth JWT
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image hosting
  ([lib/cloudinary.ts](taiba-dates/lib/cloudinary.ts))

## Architecture

Next.js App Router with Route Handlers under `app/api` as the backend. MongoDB via Mongoose;
images on Cloudinary.

**Public site** (`app/page.tsx`, `app/products/`) is composed from section components in
`components/` (Hero, Heritage, Products, Testimonials, …). The root layout
([app/layout.tsx](taiba-dates/app/layout.tsx)) sets `lang="ar" dir="rtl"` and wires up several
Google fonts as CSS variables — preserve the RTL + Arabic-first conventions when editing UI.

**Admin CMS** lives under `app/admin/` (login, products CRUD, categories CRUD) and is rendered
client-side via the typed API client in [lib/api.ts](taiba-dates/lib/api.ts).

**Data layer:**
- Models in `lib/models/` — `Admin`, `Category`, `Product`. All use the
  `mongoose.models.X ?? mongoose.model(...)` guard to survive hot-reload/serverless re-eval.
- `Product.category` is an ObjectId ref to `Category`; list/detail handlers `.populate("category")`.
- `lib/data` helpers (`data/products.ts`) fetch directly from Mongoose for server components,
  separate from the `/api` route handlers used by the admin client.

### Auth flow

- Login ([app/api/auth/login/route.ts](taiba-dates/app/api/auth/login/route.ts)) verifies a
  bcrypt password hash, signs a 1-day HS256 JWT with `jose`, and sets it as an **httpOnly
  `token` cookie** (`secure` only in production).
- [middleware.ts](taiba-dates/middleware.ts) gates all `/admin/*` routes (except `/admin/login`):
  no/invalid token → redirect to `/admin/login`.
- API route handlers protect mutations by calling `requireAdmin()`
  ([lib/auth-middleware.ts](taiba-dates/lib/auth-middleware.ts)), which re-verifies the JWT and
  loads the admin from the DB. `GET` endpoints are public; `POST`/`PUT`/`DELETE` require admin.

### Conventions to follow

- **Error handling:** wrap route-handler bodies in `try/catch` and return
  `handleApiError(err)` ([lib/api-error.ts](taiba-dates/lib/api-error.ts)). It maps Mongoose
  validation/cast errors, duplicate-key (11000 → 409), and `{ status }`-tagged errors to proper
  HTTP responses. To throw a typed HTTP error, use
  `Object.assign(new Error("msg"), { status: 4xx })`.
- **Image uploads** go through `uploadToCloudinary()`
  ([lib/upload-to-cloudinary.ts](taiba-dates/lib/upload-to-cloudinary.ts)): jpg/png/webp only,
  ≤5 MB, stored under the `taiba/products` folder. Product create/update use
  `multipart/form-data` with an `image` field, not JSON. Store both `imageUrl` and
  `imagePublicId`. `res.cloudinary.com` is the only allowlisted remote image host in
  [next.config.js](taiba-dates/next.config.js).
- **Validation:** validate ObjectIds with `mongoose.Types.ObjectId.isValid(...)` and verify
  referenced documents exist before creating relations (see the products POST handler).
- Categories and products are bilingual where relevant (`nameEN` / `nameAR`); keep both in sync.

### Creating an admin

No seed script exists. Insert an Admin document manually, hashing the password with
`Admin.hashPassword(plain)` (bcrypt, 10 rounds) from
[lib/models/Admin.ts](taiba-dates/lib/models/Admin.ts). The `passwordHash` field is stripped
from JSON output via the model's `toJSON` transform.

## Frontend structure

All frontend code lives under `taiba-dates/`. There are two distinct UIs that share almost no
styling: the **public marketing site** and the **admin CMS**.

### Server vs. client split (important)

This is the single most important thing to get right when editing the frontend.

- **Public pages and their section components are React Server Components by default.** They
  `await` data directly from the Mongoose `data/` helpers (`fetchProducts`, `fetchCategories`)
  at render time — there is no client-side fetching on the public site.
- **A component is a Client Component only when it carries `"use client"`.** These are the only
  ones that may use hooks, browser APIs, or event handlers. Current client components:
  `Navbar`, `RevealOnScroll`, `ScrollToTop`, the admin shell/forms/pages.
- The **admin CMS is entirely client-rendered** and fetches through the typed
  [lib/api.ts](taiba-dates/lib/api.ts) client (`credentials: "include"` so the auth cookie
  rides along), **not** through the `data/` Mongoose helpers.
- Two parallel data paths exist on purpose — don't cross them: server components → `data/*.ts`
  (direct DB); admin client components → `lib/api.ts` → `/api/*` route handlers.

### Routes (`app/`)

| Route | File | Type | Notes |
|-------|------|------|-------|
| `/` | [app/page.tsx](taiba-dates/app/page.tsx) | Server | Landing page; composes the section components in order. |
| `/products` | [app/products/page.tsx](taiba-dates/app/products/page.tsx) | Server | Product listing; reads `?category=<id>` from `searchParams` to filter; fetches products + categories in parallel. |
| `/admin` | [app/admin/page.tsx](taiba-dates/app/admin/page.tsx) | Server | `redirect("/admin/products")`. |
| `/admin/login` | `app/admin/login/page.tsx` | Client | Public (excluded from middleware gate). |
| `/admin/products`, `/admin/products/new`, `/admin/products/[id]` | `app/admin/products/…` | Client | Product CRUD. |
| `/admin/categories`, `/admin/categories/[id]` | `app/admin/categories/…` | Client | Category CRUD. |

Layouts: root [app/layout.tsx](taiba-dates/app/layout.tsx) sets `<html lang="ar" dir="rtl">`,
loads the `next/font` Google fonts as CSS variables, and imports `app/globals.css`. The admin
[app/admin/layout.tsx](taiba-dates/app/admin/layout.tsx) is a nested layout that imports the
separate `app/admin/admin.css` so admin styles don't leak into the public site.

### Public section components (`components/`)

Page sections, rendered in this order on `/` ([app/page.tsx](taiba-dates/app/page.tsx)):
`Navbar` → `Hero` → `Divider` → `Heritage` → `Products` → `Features` → `Testimonials` →
`CtaBanner` → `Footer` → `ScrollToTop`.

- `Navbar` (client) — scroll-aware (adds `.scrolled` after 60px), mobile hamburger menu, links
  from `data/nav.ts`.
- `Products` (server) — `await fetchProducts()`, renders the card grid with a "no products"
  empty state.
- `Heritage`, `Features`, `Testimonials`, `Hero`, `CtaBanner`, `Footer` — presentational
  sections; `Features`/`Testimonials` map over `data/features.ts` / `data/testimonials.ts`.
- `ProductsPageHero`, `CategoryFilter` — used only on `/products`. `CategoryFilter` renders
  category chips as `<Link href="/products?category=…" scroll={false}>` (filtering is driven by
  the URL query param + server re-render, no client state).
- `Logo`, `Divider` — small shared presentational pieces.
- `RevealOnScroll` (client) — wraps content and adds a `.visible` class via `IntersectionObserver`
  for scroll-in animations. Accepts `as`, `className`, `style` (commonly `transitionDelay` for
  staggered grids). Reuse this for any new "animate on scroll" UI instead of writing new observers.
- `ScrollToTop` (client) — floating back-to-top button.
- `illustrations/` — inline decorative SVG React components (`PalmSvg`, `MedjoolSvg`, `AjwaSvg`,
  `SukkariSvg`, `HeritageSvg`).

### Admin components (`components/admin/`)

- `AdminShell` (client) — the admin chrome (sidebar, topbar, mobile menu). On mount it calls
  `authApi.me()`; on a 401 it `router.replace("/admin/login")`, otherwise shows the shell. Wrap
  admin pages in this. Logout calls `authApi.logout()` then redirects.
- `ProductForm` (client) — create/edit form; builds a `FormData` (multipart, `image` field) and
  calls `productsApi.create`/`update`.

### Static content data (`data/`)

Plain TS modules, each exporting typed arrays/helpers. Two kinds:

- **Hardcoded content** — `nav.ts`, `features.ts`, `testimonials.ts`, `categories.ts` exports a
  type. Edit these to change copy; they are not in the database.
- **DB-backed server helpers** — `products.ts` (`fetchProducts`) and `categories.ts`
  (`fetchCategories`) call `connectDB()` and query Mongoose with `.lean()`, returning plain
  serializable objects for server components. They **swallow errors and return `[]`** so the
  public page still renders if the DB is unreachable — keep that resilience when editing.

### Styling

- Global CSS, **no CSS framework, no CSS modules.** [app/globals.css](taiba-dates/app/globals.css)
  (~1.5k lines) holds a large `:root` design-token system (`--color-*`, `--font-*`, `--shadow-*`,
  `--ease-*`/`--duration-*`, `--container-max`, `--nav-height`) plus all public-site component
  classes. `app/admin/admin.css` (~900 lines) is the admin equivalent, scoped via the admin layout.
- Components reference shared classes (e.g. `container`, `section-title-ar`, `product-card`,
  `btn-secondary`) and the CSS variables. **Prefer existing tokens/classes over hardcoded colors
  or new one-off CSS.** Inline `style` is used sparingly, mainly for per-item `transitionDelay`.
- **RTL + Arabic-first is the default.** Page direction is `rtl`; Arabic font stacks
  (`--font-arabic`) are the body default with Latin display fonts for accents. Most UI copy is in
  Arabic, often paired with an English label (e.g. `nameAR` / `nameEN`). Keep both in sync and
  don't assume LTR when adding layout.
- Product images use a plain `<img>` (with the `@next/next/no-img-element` lint disabled inline)
  rather than `next/image`; Cloudinary URLs are the source.
