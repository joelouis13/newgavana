"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, RefreshIcon, StarIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { uploadImage } from "@/lib/admin/upload";
import type { ProductImageInput } from "@/lib/admin/product-actions";
import { toast } from "@/lib/ui-store";

export function ImageManager({
  images,
  onChange,
  max = 12,
}: {
  images: ProductImageInput[];
  onChange: (next: ProductImageInput[]) => void;
  max?: number;
}) {
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  // Keep a live reference so concurrent uploads append correctly.
  const latest = useRef(images);
  useLayoutEffect(() => {
    latest.current = images;
  }, [images]);

  const commit = (next: ProductImageInput[]) => {
    if (next.length && !next.some((i) => i.is_primary)) next = next.map((img, i) => ({ ...img, is_primary: i === 0 }));
    latest.current = next;
    onChange(next);
  };

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, Math.max(0, max - latest.current.length));
    if (list.length === 0) {
      toast(`You can add up to ${max} images.`, { tone: "error" });
      return;
    }
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const { url, path } = await uploadImage(file, "products");
          commit([...latest.current, { image_url: url, storage_path: path, is_primary: latest.current.length === 0 }]);
        } catch (err) {
          toast(err instanceof Error ? err.message : "Upload failed", { tone: "error" });
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  async function replace(index: number, file: File) {
    setUploading((n) => n + 1);
    try {
      const { url, path } = await uploadImage(file, "products");
      // Dropping the id makes the save action delete the old row/file and insert the new one.
      commit(latest.current.map((img, i) => (i === index ? { image_url: url, storage_path: path, is_primary: img.is_primary } : img)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", { tone: "error" });
    } finally {
      setUploading((n) => n - 1);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <figure key={img.id ?? img.storage_path ?? img.image_url} className="group relative overflow-hidden rounded-xl border border-sand-200 bg-blush-50">
            <div className="relative aspect-square">
              <Image src={img.image_url} alt={`Product image ${i + 1}`} fill sizes="200px" className="object-cover" />
            </div>
            {img.is_primary && (
              <span className="absolute top-2 left-2 rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                Primary
              </span>
            )}
            <figcaption className="flex items-center justify-between gap-1 border-t border-sand-200 bg-white p-1.5">
              <div className="flex">
                <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ChevronLeftIcon size={16} />
                </IconBtn>
                <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                  <ChevronRightIcon size={16} />
                </IconBtn>
              </div>
              <div className="flex">
                <IconBtn
                  label={img.is_primary ? "Primary image" : "Set as primary"}
                  onClick={() => commit(images.map((x, j) => ({ ...x, is_primary: j === i })))}
                  active={img.is_primary}
                >
                  <StarIcon size={16} fill={img.is_primary ? "currentColor" : "none"} />
                </IconBtn>
                <IconBtn
                  label="Replace image"
                  onClick={() => {
                    setReplaceIndex(i);
                    replaceRef.current?.click();
                  }}
                >
                  <RefreshIcon size={16} />
                </IconBtn>
                <IconBtn label="Remove image" danger onClick={() => commit(images.filter((_, j) => j !== i))}>
                  <TrashIcon size={16} />
                </IconBtn>
              </div>
            </figcaption>
          </figure>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => addRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
            }}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center text-sm transition ${
              dragOver ? "border-navy-600 bg-navy-50" : "border-sand-300 bg-white hover:border-navy-600"
            }`}
          >
            <UploadIcon size={24} className="text-navy-700" />
            <span className="font-medium text-navy-900">Add images</span>
            <span className="text-xs text-muted">Tap or drop · JPG, PNG, WebP</span>
          </button>
        )}
      </div>

      {uploading > 0 && (
        <p className="mt-3 text-sm text-navy-700" aria-live="polite">
          Optimising &amp; uploading {uploading} image{uploading > 1 ? "s" : ""}…
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Images are resized and compressed automatically. The starred image is the main product photo. Removed images
        are deleted when you save.
      </p>

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && replaceIndex !== null) void replace(replaceIndex, f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
  disabled,
  danger,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 place-items-center rounded-lg transition disabled:opacity-25 ${
        danger ? "text-muted hover:bg-red-50 hover:text-red-600" : active ? "text-coral-600" : "text-muted hover:bg-navy-50 hover:text-navy-900"
      }`}
    >
      {children}
    </button>
  );
}
