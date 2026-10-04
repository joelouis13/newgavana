import { formatMoney, formatOrderNumber } from "@/lib/format";

/**
 * Normalises a phone number for wa.me links: digits only, international
 * format, no leading "+" or "00". A Ghanaian local number such as
 * 024 123 4567 becomes 233241234567.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) digits = `233${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(number: string | null | undefined, message: string): string {
  const phone = normalizeWhatsAppNumber(number);
  // encodeURIComponent handles spaces, line breaks, "&", "#", emoji etc.
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp in a new tab, falling back to same-tab navigation when a
 * popup blocker refuses. (Passing "noopener" to window.open would make it
 * always return null, so the opener is cleared manually instead.)
 */
export function openWhatsApp(url: string, existing?: Window | null) {
  const win = existing ?? window.open(url, "_blank");
  if (win) {
    win.opener = null;
    if (existing) win.location.href = url;
  } else {
    window.location.href = url;
  }
}

export function absoluteUrl(pathOrUrl: string | null | undefined, siteUrl: string): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${encodeURI(pathOrUrl)}`;
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export type MessageLine = {
  name: string;
  unitPrice: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
};

export type CustomerDetails = {
  name?: string;
  phone?: string;
  location?: string;
  notes?: string;
};

const RULE = "-------------------------";

/** Message for the "Buy on WhatsApp" button on a single product. */
export function buildSingleProductMessage(opts: {
  storeName: string;
  currency: string;
  description?: string | null;
  line: MessageLine;
}): string {
  const { storeName, currency, description, line } = opts;
  const money = (n: number) => formatMoney(n, currency);
  const out: string[] = [`Hello ${storeName}, I would like to purchase:`, ""];

  out.push(`*Product:* ${line.name}`);
  if (description) out.push(`*Description:* ${truncate(description, 220)}`);
  out.push(`*Price:* ${money(line.unitPrice)}`);
  out.push(`*Quantity:* ${line.quantity}`);
  if (line.size) out.push(`*Size:* ${line.size}`);
  if (line.color) out.push(`*Color:* ${line.color}`);
  if (line.quantity > 1) out.push(`*Product Total:* ${money(line.unitPrice * line.quantity)}`);

  if (line.imageUrl) out.push("", "*Product Image:*", line.imageUrl);
  if (line.productUrl) out.push("", "*Product Link:*", line.productUrl);

  out.push(
    "",
    `Delivery fee: To be confirmed by ${storeName}`,
    "",
    "Please assist me with the purchase and delivery.",
  );
  return out.join("\n");
}

/** Message for a full cart checkout ("Purchase on WhatsApp"). */
export function buildCartOrderMessage(opts: {
  storeName: string;
  currency: string;
  orderNumber?: number | null;
  customer: CustomerDetails;
  lines: MessageLine[];
}): string {
  const { storeName, currency, orderNumber, customer, lines } = opts;
  const money = (n: number) => formatMoney(n, currency);
  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const out: string[] = [`*${storeName.toUpperCase()} ORDER*`];

  if (orderNumber) out.push(`Order Ref: ${formatOrderNumber(orderNumber)}`);
  out.push("", `Hello ${storeName}, I would like to purchase the following products:`);

  const details = [
    customer.name && `Name: ${customer.name}`,
    customer.phone && `Phone: ${customer.phone}`,
    customer.location && `Delivery Location: ${customer.location}`,
    customer.notes && `Notes: ${customer.notes}`,
  ].filter(Boolean) as string[];

  if (details.length) out.push("", "*Customer Details*", ...details);

  out.push("", "*PRODUCTS*");
  lines.forEach((l, i) => {
    out.push("", `${i + 1}. *${l.name}*`);
    out.push(`   Price: ${money(l.unitPrice)}`);
    out.push(`   Quantity: ${l.quantity}`);
    if (l.size) out.push(`   Size: ${l.size}`);
    if (l.color) out.push(`   Color: ${l.color}`);
    out.push(`   Subtotal: ${money(l.unitPrice * l.quantity)}`);
    if (l.imageUrl) out.push(`   Image: ${l.imageUrl}`);
  });

  out.push(
    "",
    RULE,
    `*PRODUCT TOTAL: ${money(total)}*`,
    `DELIVERY: To be confirmed by ${storeName}`,
    RULE,
    "",
    "Please confirm availability and delivery details.",
  );
  return out.join("\n");
}
