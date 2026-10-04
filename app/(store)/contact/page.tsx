import type { Metadata } from "next";
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { getStoreSettings } from "@/lib/data/storefront";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Chat with us on WhatsApp, call or email. We're happy to help with sizes, orders and delivery.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getStoreSettings();
  const wa = normalizeWhatsAppNumber(s.whatsapp_number);

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">We&apos;re here to help</p>
        <h1 className="mt-3 font-display text-4xl text-navy-900 sm:text-6xl">Contact Us</h1>
        <p className="mt-4 text-lg text-muted">
          Questions about sizing, stock or delivery? The fastest way to reach us is WhatsApp.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {wa && (
          <a
            href={buildWhatsAppUrl(wa, `Hello ${s.store_name}, I have a question.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-3xl bg-wa-500 p-6 text-white transition hover:bg-wa-600 sm:col-span-2 sm:p-8"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15">
              <WhatsAppIcon size={30} />
            </span>
            <span>
              <span className="block text-xl font-semibold">Chat on WhatsApp</span>
              <span className="text-white/80">Orders, sizing help and delivery — usually a quick reply.</span>
            </span>
          </a>
        )}
        {s.contact_phone && (
          <a href={`tel:${s.contact_phone.replace(/\s/g, "")}`} className="card flex items-center gap-4 p-6 hover:border-navy-200">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blush-100 text-coral-600">
              <PhoneIcon size={22} />
            </span>
            <span>
              <span className="block text-sm text-muted">Call us</span>
              <span className="font-semibold text-navy-900">{s.contact_phone}</span>
            </span>
          </a>
        )}
        {s.contact_email && (
          <a href={`mailto:${s.contact_email}`} className="card flex items-center gap-4 p-6 hover:border-navy-200">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blush-100 text-coral-600">
              <MailIcon size={22} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-muted">Email</span>
              <span className="block truncate font-semibold text-navy-900">{s.contact_email}</span>
            </span>
          </a>
        )}
        {s.address && (
          <div className="card flex items-center gap-4 p-6 sm:col-span-2">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blush-100 text-coral-600">
              <MapPinIcon size={22} />
            </span>
            <span>
              <span className="block text-sm text-muted">Location</span>
              <span className="font-semibold text-navy-900">{s.address}</span>
            </span>
          </div>
        )}
        {!wa && !s.contact_phone && !s.contact_email && (
          <p className="card p-8 text-center text-muted sm:col-span-2">Contact details are being updated. Please check back soon.</p>
        )}
      </div>
    </div>
  );
}
