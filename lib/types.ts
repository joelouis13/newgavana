export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  sku: string | null;
  stock_quantity: number;
  sizes: string[];
  colors: string[];
  primary_image: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Product with the joined category (as returned by list queries). */
export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type ProductDetail = ProductWithCategory & {
  images: ProductImage[];
};

export const ORDER_STATUSES = [
  "whatsapp_initiated",
  "pending_confirmation",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  whatsapp_initiated: "WhatsApp Initiated",
  pending_confirmation: "Pending Confirmation",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type Order = {
  id: string;
  order_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_location: string | null;
  customer_notes: string | null;
  product_total: number;
  delivery_fee: number | null;
  total_amount: number;
  status: OrderStatus;
  source: "cart" | "buy_now";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_size: string | null;
  selected_color: string | null;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  x?: string;
  snapchat?: string;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  tagline: string | null;
  store_description: string | null;
  whatsapp_number: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  logo_url: string | null;
  currency: string;
  social_links: SocialLinks;
  hero_title: string | null;
  hero_subtitle: string | null;
  announcement_text: string | null;
  about_text: string | null;
  updated_at: string;
};

/** The subset of settings the browser needs (WhatsApp, branding, currency). */
export type PublicStoreConfig = Pick<
  StoreSettings,
  "store_name" | "whatsapp_number" | "currency" | "logo_url"
> & { site_url: string };

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
