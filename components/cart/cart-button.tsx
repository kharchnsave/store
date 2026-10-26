"use client";

import { BagIcon } from "@/components/icons";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, openCart, hydrated } = useCart();
  const label = hydrated
    ? `Cart, ${count} ${count === 1 ? "item" : "items"}`
    : "Cart";

  return (
    <button
      type="button"
      onClick={() => openCart()}
      aria-haspopup="dialog"
      aria-label={label}
      className="relative inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-cream"
    >
      <BagIcon width={22} height={22} />
      <span className="hidden lg:inline" aria-hidden="true">
        Cart
      </span>
      {hydrated && count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 left-6 min-w-5 rounded-full bg-lime px-1.5 text-center text-[11px] font-bold leading-5 text-forest lg:static lg:-ml-1"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
