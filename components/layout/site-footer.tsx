import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SnapchatIcon,
  TikTokIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/icons";
import type { Category, SocialLinks, StoreSettings } from "@/lib/types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

const SOCIALS: { key: keyof SocialLinks; label: string; Icon: typeof InstagramIcon }[] = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
  { key: "x", label: "X (Twitter)", Icon: XIcon },
  { key: "snapchat", label: "Snapchat", Icon: SnapchatIcon },
];

export function SiteFooter({ settings, categories }: { settings: StoreSettings; categories: Category[] }) {
  const wa = normalizeWhatsAppNumber(settings.whatsapp_number);
  const socials = SOCIALS.filter((s) => settings.social_links?.[s.key]);

  return (
    <footer className="mt-20 bg-navy-900 text-white/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-2xl font-bold">
            <span className="text-white">{settings.store_name.split(" ")[0]}</span>
            <span className="text-coral-400">{settings.store_name.split(" ").slice(1).join(" ")}</span>
          </p>
          {settings.store_description && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{settings.store_description}</p>
          )}
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-2">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    href={settings.social_links[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-coral-500"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-white uppercase">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-coral-400" href="/shop">All products</Link></li>
            <li><Link className="hover:text-coral-400" href="/new-arrivals">New Arrivals</Link></li>
            <li><Link className="hover:text-coral-400" href="/best-sellers">Best Sellers</Link></li>
            <li><Link className="hover:text-coral-400" href="/shop?collection=offers">Special Offers</Link></li>
            <li><Link className="hover:text-coral-400" href="/cart">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-white uppercase">Categories</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link className="hover:text-coral-400" href={`/category/${c.slug}`}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li><Link className="hover:text-coral-400" href="/categories">View all</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-white uppercase">Get in touch</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {wa && (
              <li>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-coral-400"
                >
                  <WhatsAppIcon size={18} className="text-wa-50" /> Chat on WhatsApp
                </a>
              </li>
            )}
            {settings.contact_phone && (
              <li>
                <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-coral-400">
                  <PhoneIcon size={18} /> {settings.contact_phone}
                </a>
              </li>
            )}
            {settings.contact_email && (
              <li>
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2.5 break-all hover:text-coral-400">
                  <MailIcon size={18} className="shrink-0" /> {settings.contact_email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPinIcon size={18} className="mt-0.5 shrink-0" /> {settings.address}
              </li>
            )}
            <li>
              <Link href="/contact" className="hover:text-coral-400">Contact page →</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.store_name}. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>No online payments — every order is confirmed and paid via WhatsApp.</span>
            <Link href="/admin/login" rel="nofollow" className="text-white/40 underline-offset-2 hover:text-white hover:underline">
              Staff login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
