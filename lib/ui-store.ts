"use client";

import { useSyncExternalStore } from "react";

/** Tiny observable for app-wide UI state (cart drawer, toasts). */
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: T | ((prev: T) => T)) {
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const drawer = createStore(false);

export const cartDrawer = {
  open: () => drawer.set(true),
  close: () => drawer.set(false),
};

export function useCartDrawerOpen() {
  return useSyncExternalStore(drawer.subscribe, drawer.get, () => false);
}

export type Toast = {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
  action?: { label: string; href?: string; onClick?: () => void };
};

const toasts = createStore<Toast[]>([]);
let nextId = 1;

export function toast(
  message: string,
  opts: { tone?: Toast["tone"]; action?: Toast["action"]; duration?: number } = {},
) {
  const id = nextId++;
  toasts.set((list) => [...list.slice(-2), { id, message, tone: opts.tone ?? "success", action: opts.action }]);
  setTimeout(() => dismissToast(id), opts.duration ?? 3500);
}

export function dismissToast(id: number) {
  toasts.set((list) => list.filter((t) => t.id !== id));
}

const NO_TOASTS: Toast[] = [];
export function useToasts() {
  return useSyncExternalStore(toasts.subscribe, toasts.get, () => NO_TOASTS);
}
