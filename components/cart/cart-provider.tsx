"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AVAILABILITY_ENDPOINT,
  MAX_AVAILABILITY_SKUS,
  type AvailabilityResponse,
  type LineAvailability,
} from "@/lib/cart/availability";
import { cartStore, type AddResult, type CartLine } from "@/lib/cart/cart-store";

type CartContextValue = {
  lines: CartLine[];
  /** Units in the cart, including any that can no longer be bought. */
  count: number;
  /** Total of the lines that can still be bought. */
  subtotal: number;
  /** Lines that are sold out or no longer listed. */
  unavailableCount: number;
  /** Current availability of a line, once checked against the catalogue. */
  lineStatus: (sku: string) => LineAvailability | undefined;
  /** True if the last availability check failed. */
  availabilityFailed: boolean;
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
  const [availability, setAvailability] = useState<{
    key: string;
    data: AvailabilityResponse["availability"] | null;
  } | null>(null);

  const openCart = useCallback((message = "") => {
    setNotice(message);
    setIsOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Saved lines are snapshots, so re-check them against the catalogue when
  // the set of items changes or the drawer opens.
  const skuKey = lines
    .map((line) => line.sku)
    .slice(0, MAX_AVAILABILITY_SKUS)
    .sort()
    .join("\n");
  useEffect(() => {
    if (!hydrated || skuKey === "") return;
    let cancelled = false;
    const params = new URLSearchParams(skuKey.split("\n").map((sku) => ["sku", sku]));
    fetch(`${AVAILABILITY_ENDPOINT}?${params}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((body: AvailabilityResponse) => {
        if (!cancelled) setAvailability({ key: skuKey, data: body.availability });
      })
      .catch(() => {
        if (!cancelled) setAvailability({ key: skuKey, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, skuKey, isOpen]);

  const current = availability?.key === skuKey ? availability : null;
  const lineStatus = useCallback((sku: string) => current?.data?.[sku], [current]);

  const value = useMemo<CartContextValue>(() => {
    const blocked = (line: CartLine) => {
      const status = lineStatus(line.sku)?.status;
      return status === "unavailable" || status === "sold-out";
    };
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines
        .filter((line) => !blocked(line))
        .reduce((sum, line) => sum + line.quantity * line.price, 0),
      unavailableCount: lines.filter(blocked).length,
      lineStatus,
      availabilityFailed: current !== null && current.data === null,
      hydrated,
      add: cartStore.add,
      setQuantity: cartStore.setQuantity,
      remove: cartStore.remove,
      isOpen,
      notice,
      openCart,
      closeCart,
    };
  }, [lines, lineStatus, current, hydrated, isOpen, notice, openCart, closeCart]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
