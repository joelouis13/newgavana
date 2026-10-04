"use client";

import { STORAGE_BUCKET } from "@/lib/env";
import { getBrowserClient } from "@/lib/supabase/browser";

const MAX_DIMENSION = 1600;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/**
 * Resizes to at most 1600px and re-encodes as WebP in the browser, so phone
 * photos (often 4–8 MB) become ~150–400 KB before upload. Falls back to the
 * original file if the browser can't decode it.
 */
async function optimise(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  if (file.type === "image/gif") return { blob: file, ext: "gif", type: file.type };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp") throw new Error("webp unsupported");
    return { blob: blob.size < file.size ? blob : file, ext: blob.size < file.size ? "webp" : extOf(file), type: blob.size < file.size ? "image/webp" : file.type };
  } catch {
    return { blob: file, ext: extOf(file), type: file.type };
  }
}

function extOf(file: File) {
  return (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

export async function uploadImage(file: File, folder: "products" | "categories" | "logos") {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
  if (file.size > MAX_INPUT_BYTES) throw new Error(`${file.name} is larger than 15 MB.`);

  const { blob, ext, type } = await optimise(file);
  const path = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message || "Upload failed");
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
