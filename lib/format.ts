export function formatMoney(amount: number, currency = "GHS"): string {
  const value = Number(amount) || 0;
  const hasCents = Math.round(value * 100) % 100 !== 0;
  const formatted = value.toLocaleString("en-GH", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function formatDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatOrderNumber(n: number): string {
  return `NG-${n}`;
}

/** Turns "a, b ,c" or newline-separated text into a clean, de-duplicated list. */
export function parseList(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(/[,\n]/)) {
    const v = raw.trim();
    if (v && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      out.push(v);
    }
  }
  return out;
}

export function isOnOffer(p: { price: number; compare_at_price: number | null }): boolean {
  return p.compare_at_price != null && Number(p.compare_at_price) > Number(p.price);
}

export function discountPercent(p: { price: number; compare_at_price: number | null }): number {
  if (!isOnOffer(p)) return 0;
  return Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100);
}
