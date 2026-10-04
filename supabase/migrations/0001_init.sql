-- =============================================================================
-- New Gavana — initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- =============================================================================

create extension if not exists pg_trgm;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admins
-- A user is an admin only if they have a row here. Signing up through Supabase
-- Auth alone grants nothing.
-- -----------------------------------------------------------------------------

create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create policy "Admins can see admin list"
  on public.admin_users for select
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------

create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description   text,
  image_url     text,
  image_path    text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index categories_active_order_idx on public.categories (is_active, display_order);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

create policy "Public can read active categories"
  on public.categories for select
  using (is_active or public.is_admin());

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 1 and 160),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description      text,
  price            numeric(12, 2) not null check (price >= 0),
  -- Optional "was" price. When set (and higher than price) the product is on offer.
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price > price),
  category_id      uuid references public.categories (id) on delete set null,
  sku              text unique,
  stock_quantity   integer not null default 0 check (stock_quantity >= 0),
  sizes            text[] not null default '{}',
  colors           text[] not null default '{}',
  primary_image    text,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  is_new_arrival   boolean not null default false,
  is_best_seller   boolean not null default false,
  -- Soft delete: archived products are hidden everywhere but can be restored.
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index products_category_idx     on public.products (category_id) where deleted_at is null;
create index products_active_created   on public.products (created_at desc) where is_active and deleted_at is null;
create index products_featured_idx     on public.products (created_at desc) where is_featured and is_active and deleted_at is null;
create index products_new_arrival_idx  on public.products (created_at desc) where is_new_arrival and is_active and deleted_at is null;
create index products_best_seller_idx  on public.products (created_at desc) where is_best_seller and is_active and deleted_at is null;
create index products_price_idx        on public.products (price);
create index products_name_trgm        on public.products using gin (name gin_trgm_ops);
create index products_description_trgm on public.products using gin (description gin_trgm_ops);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "Public can read active products"
  on public.products for select
  using ((is_active and deleted_at is null) or public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Product images (binaries live in Storage; only URLs/paths are stored here)
-- -----------------------------------------------------------------------------

create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  image_url     text not null,
  storage_path  text,
  is_primary    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, display_order);
create unique index product_images_one_primary on public.product_images (product_id) where is_primary;

alter table public.product_images enable row level security;

create policy "Public can read images of visible products"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and ((p.is_active and p.deleted_at is null) or public.is_admin())
    )
  );

create policy "Admins manage product images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Orders (WhatsApp order log — never implies payment was taken)
-- -----------------------------------------------------------------------------

create type public.order_status as enum (
  'whatsapp_initiated',
  'pending_confirmation',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      bigint generated always as identity (start with 1001) unique,
  customer_name     text,
  customer_phone    text,
  delivery_location text,
  customer_notes    text,
  product_total     numeric(12, 2) not null default 0,
  -- Set by staff after agreeing the fee on WhatsApp.
  delivery_fee      numeric(12, 2),
  total_amount      numeric(12, 2) generated always as (product_total + coalesce(delivery_fee, 0)) stored,
  status            public.order_status not null default 'whatsapp_initiated',
  source            text not null default 'cart' check (source in ('cart', 'buy_now')),
  admin_notes       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx  on public.orders (status, created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     uuid references public.products (id) on delete set null,
  -- Snapshots so history stays accurate after products are edited or deleted.
  product_name   text not null,
  product_image  text,
  quantity       integer not null check (quantity between 1 and 999),
  unit_price     numeric(12, 2) not null,
  subtotal       numeric(12, 2) not null,
  selected_size  text,
  selected_color text
);

create index order_items_order_idx   on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers never read or write orders directly; they go through
-- create_whatsapp_order() below. Only admins can see/manage them.
create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- Records a WhatsApp order. Prices are read from the database, never trusted
-- from the browser. Returns the order number and the authoritative line items
-- so the client can build the WhatsApp message from real prices.
create or replace function public.create_whatsapp_order(
  p_items             jsonb,
  p_customer_name     text default null,
  p_customer_phone    text default null,
  p_delivery_location text default null,
  p_customer_notes    text default null,
  p_source            text default 'cart'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id     uuid;
  v_order_number bigint;
  v_total        numeric(12, 2) := 0;
  v_item         jsonb;
  v_product      public.products%rowtype;
  v_qty          integer;
  v_lines        jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Order must contain between 1 and 50 items';
  end if;

  insert into public.orders (customer_name, customer_phone, delivery_location, customer_notes, source)
  values (
    nullif(left(trim(p_customer_name), 120), ''),
    nullif(left(trim(p_customer_phone), 40), ''),
    nullif(left(trim(p_delivery_location), 300), ''),
    nullif(left(trim(p_customer_notes), 1000), ''),
    case when p_source = 'buy_now' then 'buy_now' else 'cart' end
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and is_active and deleted_at is null;

    if not found then
      continue; -- product removed since it was added to the cart
    end if;

    v_qty := greatest(1, least(coalesce((v_item ->> 'quantity')::integer, 1), 999));

    insert into public.order_items (
      order_id, product_id, product_name, product_image, quantity,
      unit_price, subtotal, selected_size, selected_color
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.primary_image, v_qty,
      v_product.price, v_product.price * v_qty,
      nullif(left(v_item ->> 'size', 40), ''),
      nullif(left(v_item ->> 'color', 40), '')
    );

    v_total := v_total + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'unit_price', v_product.price,
      'quantity', v_qty
    );
  end loop;

  if jsonb_array_length(v_lines) = 0 then
    raise exception 'None of the products in this order are available';
  end if;

  update public.orders set product_total = v_total where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'product_total', v_total,
    'items', v_lines
  );
end;
$$;

revoke all on function public.create_whatsapp_order(jsonb, text, text, text, text, text) from public;
grant execute on function public.create_whatsapp_order(jsonb, text, text, text, text, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Store settings (single row, id = 1)
-- -----------------------------------------------------------------------------

create table public.store_settings (
  id                int primary key default 1 check (id = 1),
  store_name        text not null default 'New Gavana',
  tagline           text default 'Convenience Shopping',
  store_description text,
  whatsapp_number   text,
  contact_phone     text,
  contact_email     text,
  address           text,
  logo_url          text,
  currency          text not null default 'GHS',
  social_links      jsonb not null default '{}'::jsonb,
  hero_title        text,
  hero_subtitle     text,
  announcement_text text,
  about_text        text,
  updated_at        timestamptz not null default now()
);

create trigger store_settings_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

create policy "Public can read store settings"
  on public.store_settings for select
  using (true);

create policy "Admins update store settings"
  on public.store_settings for update
  using (public.is_admin())
  with check (public.is_admin());

insert into public.store_settings (
  id, store_name, tagline, store_description, currency,
  hero_title, hero_subtitle, announcement_text, about_text
) values (
  1,
  'New Gavana',
  'Convenience Shopping',
  'Curated fashion, shapewear, lingerie, bags and lifestyle pieces for the modern woman — ordered in minutes on WhatsApp.',
  'GHS',
  'Elegance, delivered to your door.',
  'Corsets, lingerie, bags and everyday luxuries chosen for you. Browse, pick your favourites and order directly on WhatsApp.',
  'No online payment needed — order on WhatsApp and pay when we confirm.',
  'New Gavana is a women''s fashion and lifestyle store built around convenience. We curate shapewear, lingerie, bags, accessories and everyday essentials, and we serve every customer personally on WhatsApp — from choosing a size to arranging delivery.'
);

-- -----------------------------------------------------------------------------
-- Storage bucket for product / category / logo images
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-images', 'store-images', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do nothing;

create policy "Public can view store images"
  on storage.objects for select
  using (bucket_id = 'store-images');

create policy "Admins upload store images"
  on storage.objects for insert
  with check (bucket_id = 'store-images' and public.is_admin());

create policy "Admins update store images"
  on storage.objects for update
  using (bucket_id = 'store-images' and public.is_admin());

create policy "Admins delete store images"
  on storage.objects for delete
  using (bucket_id = 'store-images' and public.is_admin());

-- -----------------------------------------------------------------------------
-- Starter categories (fully editable from the admin dashboard)
-- -----------------------------------------------------------------------------

insert into public.categories (name, slug, description, display_order) values
  ('Corsets',     'corsets',     'Waist trainers, shapewear and corsets that sculpt and support.', 1),
  ('Lingeries',   'lingeries',   'Soft, seamless and beautiful lingerie sets.',                    2),
  ('Panties',     'panties',     'Everyday comfort and occasion-ready panties.',                    3),
  ('Gym Wear',    'gym-wear',    'Activewear made to move with you.',                               4),
  ('Night Wear',  'night-wear',  'Sleepwear and loungewear for slow evenings.',                     5),
  ('Bags',        'bags',        'Totes, handbags and everyday carry.',                             6),
  ('Dresses',     'dresses',     'Dresses for every day and every occasion.',                       7),
  ('Tops',        'tops',        'Crop tops, blouses and essentials.',                              8),
  ('Bottoms',     'bottoms',     'Trousers, skirts, shorts and leggings.',                          9),
  ('Accessories', 'accessories', 'Jewellery and finishing touches.',                               10),
  ('Shoes',       'shoes',       'Heels, flats and sneakers.',                                     11),
  ('Other',       'other',       'Beauty tools, home and lifestyle finds.',                        12);
