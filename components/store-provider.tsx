"use client";

import { createContext, useContext } from "react";
import type { PublicStoreConfig } from "@/lib/types";

const StoreContext = createContext<PublicStoreConfig | null>(null);

export function StoreProvider({
  config,
  children,
}: {
  config: PublicStoreConfig;
  children: React.ReactNode;
}) {
  return <StoreContext.Provider value={config}>{children}</StoreContext.Provider>;
}

export function useStore(): PublicStoreConfig {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
