// Seeds starter products from the photos in /public into Supabase.
//
//   npm run seed
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
// The service-role key bypasses RLS: it is used only by this local script and
// is never imported by the web app. Safe to re-run — existing slugs are skipped.
// Prices, sizes and descriptions are starting points: edit them in /admin.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1); // safe here: no network handles are open yet
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = "store-images";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const img = (folder, stamp) => `${folder}/WhatsApp Image 2026-10-04 at 04.52.${stamp}.jpeg`;

const PRODUCTS = [
  {
    name: "Double-Belt Neoprene Waist Trainer",
    category: "corsets",
    price: 250,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    stock: 25,
    flags: { is_featured: true, is_best_seller: true },
    description:
      "1.3mm neoprene waist trainer with a front zip and two adjustable compression belts for a snatched, sculpted waist. Boosts core heat during workouts and stays comfortable under everyday clothes.",
    images: [img("corset", "08 (1)"), img("corset", "19"), img("corset", "16")],
  },
  {
    name: "Zip & Hook Latex Waist Trainer Corset",
    category: "corsets",
    price: 280,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    stock: 18,
    flags: { is_new_arrival: true, is_best_seller: true },
    description:
      "Steel-boned waist cincher with a three-row hook closure and an outer zip for a secure hourglass fit. Flexible bones move with you while keeping firm tummy control.",
    images: [img("corset", "14")],
  },
  {
    name: "Open-Bust Hook-Front Body Shaper",
    category: "corsets",
    price: 320,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Brown", "Black"],
    stock: 12,
    flags: { is_featured: true, is_new_arrival: true },
    description:
      "Full bodysuit shaper with adjustable straps, an open bust so you can wear your own bra, and a hook-front panel for targeted tummy and waist sculpting. Convenient hook gusset.",
    images: [img("corset", "10 (1)")],
  },
  {
    name: "High-Waist Hook-Front Shaping Shorts",
    category: "corsets",
    price: 200,
    sizes: ["S/M", "L/XL", "XXL/3XL"],
    colors: ["Black"],
    stock: 20,
    flags: { is_best_seller: true },
    description:
      "Seamless high-waist shaping shorts with a hook-and-eye front that flattens the tummy, smooths the thighs and lifts the hips. Invisible under dresses and bodycon outfits.",
    images: [img("corset", "12 (1)")],
  },
  {
    name: "Slim Curve Tummy Control Shorts",
    category: "corsets",
    price: 180,
    sizes: ["S/M", "L/XL", "XXL/3XL"],
    colors: ["Nude", "Black"],
    stock: 30,
    flags: { is_new_arrival: true },
    description:
      "Breathable high-rise shapewear shorts with a reinforced hook panel for everyday tummy control. Soft, stretchy knit that doesn't roll down.",
    images: [img("corset", "09")],
  },
  {
    name: "Snatch Me Up Bandage Waist Wrap",
    category: "corsets",
    price: 150,
    compare_at_price: 190,
    sizes: ["One Size"],
    colors: ["Black"],
    stock: 40,
    flags: {},
    description:
      "Adjustable elastic bandage wrap for a customised cinch — wrap as tight as you like. Sauna effect for workouts; folds flat for travel.",
    images: [img("corset", "18 (1)")],
  },
  {
    name: "Seamless Scalloped Bralette & Panty Set",
    category: "lingeries",
    price: 150,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    stock: 22,
    flags: { is_new_arrival: true, is_featured: true },
    description:
      "Ultra-soft, wire-free seamless bralette with matching high-waist panty. Scalloped edges and a tiny pink heart detail — comfortable enough for all day, pretty enough for date night.",
    images: [img("lingeries", "10")],
  },
  {
    name: "Strapless Adhesive Push-Up Bra",
    category: "lingeries",
    price: 90,
    sizes: ["A", "B", "C", "D"],
    colors: ["Nude", "Black"],
    stock: 35,
    flags: { is_best_seller: true },
    description:
      "Reusable self-adhesive wing bra with a front clasp for instant lift and cleavage. Perfect for backless, strapless and bridesmaid dresses.",
    images: [img("general products", "11")],
  },
  {
    name: "Ribbed Crop Top with Sparkle Straps",
    category: "tops",
    price: 120,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    stock: 15,
    flags: { is_new_arrival: true },
    description:
      "Stretch-ribbed scoop-neck crop top with glittering rhinestone straps. Pair with high-waist jeans for an easy going-out look.",
    images: [img("general products", "08 (2)")],
  },
  {
    name: "Classic Leather Tote Bag with Pouch",
    category: "bags",
    price: 300,
    compare_at_price: 350,
    sizes: [],
    colors: ["Black", "Wine"],
    stock: 14,
    flags: { is_featured: true, is_best_seller: true },
    description:
      "Roomy structured tote in smooth faux leather with adjustable buckle straps and a matching zip pouch. Fits a laptop, makeup bag and all your everyday essentials.",
    images: [img("bags", "13"), img("bags", "13 (1)")],
  },
  {
    name: "7-Day Heart Stud Earrings Gift Set",
    category: "accessories",
    price: 130,
    sizes: [],
    colors: [],
    stock: 25,
    flags: { is_featured: true, is_new_arrival: true },
    description:
      "Seven pairs of sparkling heart and pearl studs — one for every day of the week — presented in a “Just For You” gift box. A lovely birthday or anniversary gift.",
    images: [img("general products", "12")],
  },
  {
    name: "Rechargeable Lady Shaver",
    category: "other",
    price: 160,
    sizes: [],
    colors: ["Blue", "Pink", "Rose Gold"],
    stock: 20,
    flags: { is_best_seller: true },
    description:
      "Gentle foil shaver designed for women — underarms, legs, arms and bikini line. USB rechargeable, cordless and compact for travel.",
    images: [img("general products", "17 (1)"), img("general products", "17 (2)"), img("general products", "18")],
  },
  {
    name: "Face Sculpture Makeup Brush Holder",
    category: "other",
    price: 140,
    sizes: [],
    colors: ["Hands Design", "Bust Design"],
    stock: 16,
    flags: { is_new_arrival: true },
    description:
      "Matte white artistic face sculpture that keeps your brushes organised and turns your vanity into a statement. Also works as a small vase.",
    images: [img("general products", "16 (1)"), img("general products", "17")],
  },
  {
    name: "Foldable Silicone Travel Kettle",
    category: "other",
    price: 220,
    sizes: [],
    colors: ["Pink", "Blue"],
    stock: 10,
    flags: {},
    description:
      "Collapsible electric kettle that folds flat for travel and small spaces. Boils quickly with automatic power-off protection.",
    images: [img("general products", "15")],
  },
];

const CATEGORY_COVERS = {
  corsets: img("corset", "14"),
  lingeries: img("lingeries", "10"),
  bags: img("bags", "13 (1)"),
  tops: img("general products", "08 (2)"),
  accessories: img("general products", "12"),
  other: img("general products", "16 (1)"),
};

function slugify(s) {
  return s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Each record gets its own file so deleting one never removes another's image.
async function upload(relPath, key) {
  const file = await readFile(path.join(PUBLIC_DIR, relPath));
  const storagePath = `seed/${key}.jpeg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: "image/jpeg", cacheControl: "31536000", upsert: true });
  if (error) throw new Error(`Upload failed for ${relPath}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: data.publicUrl, path: storagePath };
}

async function main() {
  const { data: categories, error: catErr } = await supabase.from("categories").select("id, slug, image_url");
  if (catErr) throw new Error(`Could not read categories — did you run the migration? ${catErr.message}`);
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  let created = 0;
  for (const [i, p] of PRODUCTS.entries()) {
    const slug = slugify(p.name);
    const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      console.log(`• skip   ${p.name} (already exists)`);
      continue;
    }

    const images = [];
    for (const [j, rel] of p.images.entries()) images.push(await upload(rel, `${slug}-${j + 1}`));

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        compare_at_price: p.compare_at_price ?? null,
        category_id: bySlug.get(p.category)?.id ?? null,
        sku: `NG-${String(i + 1).padStart(3, "0")}`,
        stock_quantity: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        primary_image: images[0]?.url ?? null,
        is_active: true,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        ...p.flags,
      })
      .select("id")
      .single();
    if (error) throw new Error(`Insert failed for ${p.name}: ${error.message}`);

    const { error: imgErr } = await supabase.from("product_images").insert(
      images.map((im, j) => ({
        product_id: product.id,
        image_url: im.url,
        storage_path: im.path,
        is_primary: j === 0,
        display_order: j,
      })),
    );
    if (imgErr) throw new Error(`Image rows failed for ${p.name}: ${imgErr.message}`);
    created++;
    console.log(`✓ added  ${p.name}`);
  }

  for (const [slug, rel] of Object.entries(CATEGORY_COVERS)) {
    const cat = bySlug.get(slug);
    if (!cat || cat.image_url) continue;
    const im = await upload(rel, `category-${slug}`);
    await supabase.from("categories").update({ image_url: im.url, image_path: im.path }).eq("id", cat.id);
    console.log(`✓ cover  ${slug}`);
  }

  console.log(`\nDone. ${created} product(s) created.`);
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exitCode = 1;
});
