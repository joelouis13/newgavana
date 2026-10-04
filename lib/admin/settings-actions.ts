"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { errorMessage, removeStorageFiles, revalidateStorefront } from "@/lib/admin/helpers";
import type { ActionResult, SocialLinks } from "@/lib/types";

export type SettingsInput = {
  store_name: string;
  tagline: string;
  store_description: string;
  whatsapp_number: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  logo_url: string | null;
  currency: string;
  social_links: SocialLinks;
  hero_title: string;
  hero_subtitle: string;
  announcement_text: string;
  about_text: string;
};

const blank = (v: string) => v.trim() || null;

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const fieldErrors: Record<string, string> = {};
  if (!input.store_name.trim()) fieldErrors.store_name = "Store name is required.";
  const digits = input.whatsapp_number.replace(/\D/g, "");
  if (!digits) fieldErrors.whatsapp_number = "A WhatsApp number is required to receive orders.";
  else if (digits.length < 9 || digits.length > 15) fieldErrors.whatsapp_number = "Enter a valid number, e.g. 233241234567.";
  if (input.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact_email.trim()))
    fieldErrors.contact_email = "Enter a valid email address.";
  if (!/^[A-Z]{3}$/.test(input.currency.trim().toUpperCase())) fieldErrors.currency = "Use a 3-letter code, e.g. GHS.";
  for (const [k, v] of Object.entries(input.social_links)) {
    if (v && !/^https?:\/\//i.test(v)) fieldErrors[`social_${k}`] = "Use a full link starting with https://";
  }
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const { supabase } = await requireAdminAction();
    const { data: before } = await supabase.from("store_settings").select("logo_url").eq("id", 1).single();

    const social = Object.fromEntries(Object.entries(input.social_links).filter(([, v]) => v && v.trim()));
    const { error } = await supabase
      .from("store_settings")
      .update({
        store_name: input.store_name.trim(),
        tagline: blank(input.tagline),
        store_description: blank(input.store_description),
        whatsapp_number: input.whatsapp_number.trim(),
        contact_phone: blank(input.contact_phone),
        contact_email: blank(input.contact_email),
        address: blank(input.address),
        logo_url: input.logo_url,
        currency: input.currency.trim().toUpperCase(),
        social_links: social,
        hero_title: blank(input.hero_title),
        hero_subtitle: blank(input.hero_subtitle),
        announcement_text: blank(input.announcement_text),
        about_text: blank(input.about_text),
      })
      .eq("id", 1);
    if (error) throw error;

    // Remove a replaced logo from storage (only files we uploaded live under logos/).
    const oldUrl = before?.logo_url as string | null | undefined;
    if (oldUrl && oldUrl !== input.logo_url) {
      const marker = "/store-images/";
      const idx = oldUrl.indexOf(marker);
      if (idx >= 0) await removeStorageFiles(supabase, [decodeURIComponent(oldUrl.slice(idx + marker.length))]);
    }

    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[admin] saveSettings", err);
    return { ok: false, error: errorMessage(err) };
  }
}
