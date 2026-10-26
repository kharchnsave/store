"use client";

import Link from "next/link";
import { fullName } from "@/lib/catalog/product-utils";
import { formatPrice, pluralize } from "@/lib/format";
import { useCart } from "./cart-provider";

/**
 * Shown instead of a checkout while no commerce backend is connected.
 * It never collects payment or personal details.
 */
export function CheckoutHandoff() {
  const { lines, count, subtotal, hydrated } = useCart();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="rounded-lg border border-line p-6 md:p-8">
        <p className="eyebrow text-muted">Demo store</p>
        <h2 className="mt-2 text-xl font-bold md:text-2xl">Checkout isn&apos;t connected yet</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/85">
          <p>
            Kharch n Save is running as a preview. Your cart works and is saved on this
            device, but there is no payment step yet, so no order can be placed and nothing
            will be charged.
          </p>
          <p>
            Once the store is connected to its commerce platform, the Checkout button will
            pass your cart to that platform&apos;s checkout to confirm delivery details and
            payment.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/cart" className="btn btn-forest">
            Back to cart
          </Link>
          <Link href="/shop" className="btn btn-outline">
            Continue shopping
          </Link>
        </div>
      </div>

      <section aria-labelledby="handoff-summary" className="rounded-lg bg-cream p-5">
        <h2 id="handoff-summary" className="text-base font-bold">
          Cart summary
        </h2>
        {!hydrated ? (
          <p className="mt-3 text-sm text-muted">Loading your cart…</p>
        ) : lines.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Your cart is empty.</p>
        ) : (
          <>
            <ul className="mt-3 space-y-2 text-sm">
              {lines.map((line) => (
                <li key={line.sku} className="flex justify-between gap-4">
                  <span className="min-w-0">
                    {line.quantity} × {fullName(line)}
                    <span className="text-muted"> · EU {line.size}</span>
                  </span>
                  <span className="shrink-0">{formatPrice(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between border-t border-line pt-3 font-semibold">
              <span>Subtotal ({pluralize(count, "item")})</span>
              <span>{formatPrice(subtotal)}</span>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
