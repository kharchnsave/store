"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { cartStore, type AddResult, type CartLine } from "@/lib/cart/cart-store";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** False until the saved cart has been read on the client. */
  hydrated: boolean;
  add: (item: Omit<CartLine, "quantity">) => AddResult;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  isOpen: boolean;
  /** Short status message announced inside the cart drawer. */
  notice: string;
  openCart: (notice?: string) => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const subscribeNoop = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const openCart = useCallback((message = "") => {
    setNotice(message);
    setIsOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
      hydrated,
      add: cartStore.add,
      setQuantity: cartStore.setQuantity,
      remove: cartStore.remove,
      isOpen,
      notice,
      openCart,
      closeCart,
    }),
    [lines, hydrated, isOpen, notice, openCart, closeCart],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
