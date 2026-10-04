"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  /** productId + size + color — the same product in two sizes is two lines. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  /** Stock at the time of adding; used to cap quantity in the UI. */
  maxQuantity: number;
};

const STORAGE_KEY = "newgavana.cart.v1";
const MAX_QTY = 99;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.productId && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    items = read();
    loaded = true;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage full: the cart still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      items = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return items;
}

const getServerSnapshot = () => EMPTY;

export function cartKey(productId: string, size: string | null, color: string | null) {
  return [productId, size ?? "", color ?? ""].join("|");
}

function clampQty(qty: number, max: number) {
  const cap = Math.min(MAX_QTY, max > 0 ? max : MAX_QTY);
  return Math.max(1, Math.min(Math.floor(qty) || 1, cap));
}

export const cart = {
  add(item: Omit<CartItem, "key" | "quantity">, quantity = 1) {
    ensureLoaded();
    const key = cartKey(item.productId, item.size, item.color);
    const existing = items.find((i) => i.key === key);
    if (existing) {
      commit(
        items.map((i) =>
          i.key === key
            ? { ...i, ...item, key, quantity: clampQty(i.quantity + quantity, item.maxQuantity) }
            : i,
        ),
      );
    } else {
      commit([...items, { ...item, key, quantity: clampQty(quantity, item.maxQuantity) }]);
    }
  },
  setQuantity(key: string, quantity: number) {
    ensureLoaded();
    if (quantity <= 0) return cart.remove(key);
    commit(items.map((i) => (i.key === key ? { ...i, quantity: clampQty(quantity, i.maxQuantity) } : i)));
  },
  remove(key: string) {
    ensureLoaded();
    commit(items.filter((i) => i.key !== key));
  },
  clear() {
    commit([]);
  },
};

export function useCart() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = list.reduce((n, i) => n + i.quantity, 0);
  const subtotal = list.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items: list, count, subtotal };
}
