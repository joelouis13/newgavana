import { AdminPageHeader } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdminPage } from "@/lib/admin/auth";
import { DEFAULT_SETTINGS } from "@/lib/data/storefront";
import type { StoreSettings } from "@/lib/types";

export const metadata = { title: "Store Settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(data ?? {}), social_links: data?.social_links ?? {} } as StoreSettings;

  return (
    <>
      <AdminPageHeader title="Store Settings" description="Changes appear on the website within a minute." />
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Could not load settings: {error.message}</p>}
      <SettingsForm settings={settings} />
    </>
  );
}
