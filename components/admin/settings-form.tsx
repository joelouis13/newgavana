"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { saveSettings, type SettingsInput } from "@/lib/admin/settings-actions";
import { uploadImage } from "@/lib/admin/upload";
import type { SocialLinks, StoreSettings } from "@/lib/types";
import { toast } from "@/lib/ui-store";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/newgavana" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/newgavana" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@newgavana" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/newgavana" },
  { key: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/newgavana" },
];

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<SettingsInput>({
    store_name: settings.store_name,
    tagline: settings.tagline ?? "",
    store_description: settings.store_description ?? "",
    whatsapp_number: settings.whatsapp_number ?? "",
    contact_phone: settings.contact_phone ?? "",
    contact_email: settings.contact_email ?? "",
    address: settings.address ?? "",
    logo_url: settings.logo_url,
    currency: settings.currency,
    social_links: settings.social_links ?? {},
    hero_title: settings.hero_title ?? "",
    hero_subtitle: settings.hero_subtitle ?? "",
    announcement_text: settings.announcement_text ?? "",
    about_text: settings.about_text ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const logoRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function onLogo(file: File) {
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "logos");
      set("logo_url", url);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", { tone: "error" });
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSettings(form);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast(res.error, { tone: "error" });
        return;
      }
      toast("Settings saved");
      router.refresh();
    });
  }

  const err = (k: string) => errors[k] && <p className="field-error">{errors[k]}</p>;
  const waDigits = normalizeWhatsAppNumber(form.whatsapp_number);

  return (
    <form onSubmit={submit} noValidate className="grid max-w-4xl gap-6">
      <section className="card border-wa-500/30 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy-900">
          <WhatsAppIcon size={20} className="text-wa-500" /> WhatsApp orders
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">Every “Buy on WhatsApp” and “Purchase on WhatsApp” message is sent to this number.</p>
        <label htmlFor="s-wa" className="field-label">WhatsApp business number *</label>
        <input
          id="s-wa"
          className="field max-w-sm"
          type="tel"
          inputMode="tel"
          value={form.whatsapp_number}
          onChange={(e) => set("whatsapp_number", e.target.value)}
          placeholder="e.g. 233241234567 or 024 123 4567"
          aria-invalid={!!errors.whatsapp_number}
        />
        {err("whatsapp_number")}
        {waDigits && !errors.whatsapp_number && (
          <p className="mt-2 text-xs text-muted">
            Messages go to <strong className="text-navy-900">+{waDigits}</strong>.{" "}
            <a href={buildWhatsAppUrl(waDigits, "Test message from the New Gavana website")} target="_blank" rel="noopener noreferrer" className="font-semibold text-wa-600 underline">
              Send a test
            </a>
          </p>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-navy-900">Brand</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="s-name" className="field-label">Store name *</label>
            <input id="s-name" className="field" value={form.store_name} onChange={(e) => set("store_name", e.target.value)} aria-invalid={!!errors.store_name} />
            {err("store_name")}
          </div>
          <div>
            <label htmlFor="s-tagline" className="field-label">Tagline</label>
            <input id="s-tagline" className="field" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="s-desc" className="field-label">Store description</label>
            <textarea id="s-desc" className="field min-h-20" value={form.store_description} onChange={(e) => set("store_description", e.target.value)} />
            <p className="mt-1 text-xs text-muted">Used in the footer and for search engines.</p>
          </div>
          <div>
            <p className="field-label">Logo</p>
            <div className="flex items-center gap-3">
              <span className="relative grid h-16 w-28 place-items-center overflow-hidden rounded-xl border border-sand-200 bg-white">
                <Image src={form.logo_url ?? "/brand/logo-full.png"} alt="Store logo" fill sizes="112px" className="object-contain p-1" />
              </span>
              <div className="flex flex-col items-start gap-1">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => logoRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload logo"}
                </button>
                {form.logo_url && (
                  <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => set("logo_url", null)}>
                    Use default logo
                  </button>
                )}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onLogo(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="s-currency" className="field-label">Currency code</label>
            <input id="s-currency" className="field max-w-32 uppercase" maxLength={3} value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} aria-invalid={!!errors.currency} />
            {err("currency")}
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-navy-900">Homepage</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="s-ann" className="field-label">Announcement bar</label>
            <input id="s-ann" className="field" value={form.announcement_text} onChange={(e) => set("announcement_text", e.target.value)} placeholder="Leave empty to hide" />
          </div>
          <div>
            <label htmlFor="s-hero-title" className="field-label">Hero headline</label>
            <input id="s-hero-title" className="field" value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-hero-sub" className="field-label">Hero promotional text</label>
            <textarea id="s-hero-sub" className="field min-h-20" value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-about" className="field-label">About page text</label>
            <textarea id="s-about" className="field min-h-32" value={form.about_text} onChange={(e) => set("about_text", e.target.value)} />
            <p className="mt-1 text-xs text-muted">Separate paragraphs with a blank line.</p>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-navy-900">Contact information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="s-phone" className="field-label">Phone</label>
            <input id="s-phone" className="field" type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-email" className="field-label">Email</label>
            <input id="s-email" className="field" type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} aria-invalid={!!errors.contact_email} />
            {err("contact_email")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="s-address" className="field-label">Address / location</label>
            <input id="s-address" className="field" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. Accra, Ghana" />
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-navy-900">Social media</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label htmlFor={`s-${key}`} className="field-label">{label}</label>
              <input
                id={`s-${key}`}
                className="field"
                type="url"
                value={form.social_links[key] ?? ""}
                onChange={(e) => set("social_links", { ...form.social_links, [key]: e.target.value })}
                placeholder={placeholder}
                aria-invalid={!!errors[`social_${key}`]}
              />
              {err(`social_${key}`)}
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-sand-200 bg-[#f6f4f2]/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button type="submit" className="btn btn-primary w-full px-8 py-3 sm:w-auto" disabled={pending || uploading}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
