# New Gavana

WhatsApp-first women's fashion & lifestyle store. Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase.

**There is no online payment.** Every purchase ends in WhatsApp: a single product via **Buy on WhatsApp**, or the whole cart via **Purchase on WhatsApp**. The site builds a formatted order message (customer details, items, sizes/colours, prices, subtotals, product total, "Delivery: to be confirmed") and opens a chat with the store's number.

## Setup

1. **Create a Supabase project** at <https://supabase.com>.
2. **Run the schema.** In Supabase → SQL Editor, paste and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). It creates the tables, Row Level Security policies, the `store-images` storage bucket, the order RPC, default settings and the 12 starter categories.
3. **Environment.** Copy `.env.example` to `.env.local` and fill in the values from Supabase → Project Settings → API.
4. **Install and seed.**
   ```bash
   npm install
   npm run seed   # uploads the photos in /public as 14 starter products (optional, safe to re-run)
   ```
5. **Create your admin login.**
   - Supabase → Authentication → Users → **Add user** (email + password, auto-confirm).
   - SQL Editor:
     ```sql
     insert into public.admin_users (user_id)
     select id from auth.users where email = 'you@example.com';
     ```
   - Turn off public sign-ups (Authentication → Sign In / Providers → disable "Allow new users to sign up"). Even if someone signs up, they get no admin access without a row in `admin_users`.
6. **Run it.** `npm run dev`, then open <http://localhost:3000>. The admin area is at `/admin`.
7. **Set your WhatsApp number** in Admin → Store Settings. Until you do, orders open WhatsApp without a recipient.

## Deploying (e.g. Vercel)

Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` (your real domain, used in WhatsApp product links and the sitemap). **Do not** add `SUPABASE_SERVICE_ROLE_KEY` to hosting; only the local seed script uses it.

## How it fits together

| Area | Where |
|---|---|
| Storefront pages | `app/(store)/` — home, shop, category, product, cart, checkout, about, contact |
| Admin | `app/admin/(panel)/` — dashboard, products, categories, orders, settings; login in `app/admin/(auth)/` |
| WhatsApp message + link builder | `lib/whatsapp.ts` |
| Cart (localStorage, synced across tabs) | `lib/cart.ts` |
| Storefront queries (anon key + RLS, cached) | `lib/data/storefront.ts` |
| Admin server actions (re-check admin on every call) | `lib/admin/*-actions.ts` |
| Image upload (resized to ≤1600px WebP in the browser) | `lib/admin/upload.ts` |
| Route protection for `/admin` | `proxy.ts` + `lib/admin/auth.ts` |

### Key decisions

- **Orders are logs, not payments.** When a customer taps *Purchase on WhatsApp*, `create_whatsapp_order()` records the order with status *WhatsApp Initiated*. Prices are taken from the database, not the browser, and the message includes an order reference (e.g. `NG-1001`) so staff can match chats to orders. If logging fails, WhatsApp still opens. Staff update status and the agreed delivery fee on the order page.
- **Soft delete.** *Delete* on a product moves it to *Archived*, where it can be restored or deleted permanently. Order history keeps name and price snapshots either way.
- **Categories are data.** The menu, filters, footer and sitemap all read active categories from the database, in display order.
- **Collections are flags.** New Arrivals, Best Sellers and Featured come from `is_new_arrival`, `is_best_seller` and `is_featured`. *Special Offers* are products with an *Original price* above their selling price. For automatic best sellers later, aggregate `order_items` by `product_id`.
- **Caching.** Storefront pages are statically cached and revalidate every 60 s. Any admin change purges them immediately.
- **Scale.** Listings are paginated (24 per page). Search uses trigram indexes on name and description, plus a category-name match.

## Scripts

| Command | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run seed` | Upload starter products from `/public` |
