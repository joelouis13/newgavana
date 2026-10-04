// Only NEXT_PUBLIC_* values are referenced here so this module is safe to import
// from client components. The service-role key is never read by the app itself
// (it is used only by the local seed script).

// Tolerate a pasted REST endpoint ("…supabase.co/rest/v1/") — the client wants the bare project URL.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export const STORAGE_BUCKET = "store-images";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
