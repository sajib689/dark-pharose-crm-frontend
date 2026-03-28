"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { store, AppStore } from "./store";

/**
 * Wrap your app with this in the root layout.
 * Must be a Client Component because it uses React context.
 * Uses a ref so the store is created only once per app lifetime.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = store;
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
