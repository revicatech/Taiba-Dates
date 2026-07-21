"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;          // unique line id
  productId: string;
  name: string;
  grade?: string;      // الحجم / الصنف, e.g. جامبو
  weight?: string;     // الوزن, e.g. 500 g
  unitLabel?: string;  // بالحبة / صندوق 20 قطعة
  imageUrl?: string;
  qty: number;
};

export type AddCartItem = Omit<CartItem, "id" | "qty"> & { qty?: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (item: AddCartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tiba_cart_v1";

// Identical option combinations collapse into one line (qty increments).
function lineKey(i: Pick<CartItem, "productId" | "grade" | "weight" | "unitLabel">) {
  return [i.productId, i.grade ?? "", i.weight ?? "", i.unitLabel ?? ""].join("|");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist on change (after the initial load so we don't clobber it).
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, hydrated]);

  const addItem = useCallback((item: AddCartItem) => {
    setItems((prev) => {
      const key = lineKey(item);
      const idx = prev.findIndex((p) => lineKey(p) === key);
      const qty = item.qty ?? 1;
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty, id: `${key}:${Date.now()}` }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((p) => (p.id === id ? (qty <= 0 ? [] : [{ ...p, qty }]) : [p]))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, isOpen, open, close, addItem, removeItem, setQty, clear }),
    [items, count, isOpen, open, close, addItem, removeItem, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
