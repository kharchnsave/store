"use client";

import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { StatusBadge } from "@/components/product/badges";
import type { CartLine } from "@/lib/cart/cart-store";
import { CONDITION_LABELS } from "@/lib/catalog/labels";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart-provider";

function QuantityControl({ line }: { line: CartLine }) {
  const { setQuantity } = useCart();

  if (line.status === "preloved") {
    return (
      <p className="text-xs text-muted">
        Qty 1 · one-off pre-loved pair
      </p>
    );
  }

  const atLimit = line.quantity >= line.maxQuantity;
  return (
    <div>
      <div className="inline-flex items-center rounded-md border border-line">
        <button
          type="button"
          onClick={() => setQuantity(line.sku, line.quantity - 1)}
          disabled={line.quantity <= 1}
          className="inline-flex size-8 items-center justify-center rounded-l-md hover:bg-cream disabled:cursor-not-allowed disabled:text-line"
          aria-label={`Decrease quantity of ${line.name}`}
        >
          <MinusIcon width={16} height={16} />
        </button>
        <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">
          <span className="sr-only">Quantity </span>
          {line.quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity(line.sku, line.quantity + 1)}
          disabled={atLimit}
          className="inline-flex size-8 items-center justify-center rounded-r-md hover:bg-cream disabled:cursor-not-allowed disabled:text-line"
          aria-label={`Increase quantity of ${line.name}`}
        >
          <PlusIcon width={16} height={16} />
        </button>
      </div>
      {atLimit ? (
        <p className="mt-1 text-xs text-muted">
          Only {line.maxQuantity} available in EU {line.size}
        </p>
      ) : null}
    </div>
  );
}

export function CartLines({
  onNavigate,
  imageSize = 88,
}: {
  onNavigate?: () => void;
  imageSize?: number;
}) {
  const { lines, remove } = useCart();

  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => (
        <li key={line.sku} className="flex gap-4 py-4">
          <div
            className="relative shrink-0 overflow-hidden rounded-md bg-cream"
            style={{ width: imageSize, height: imageSize }}
          >
            <Image
              src={line.image.src}
              alt={line.image.alt}
              fill
              sizes={`${imageSize}px`}
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {line.brand}
                </p>
                <Link
                  href={`/products/${line.slug}`}
                  onClick={onNavigate}
                  className="text-sm font-medium leading-snug hover:underline"
                >
                  {line.name}
                </Link>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatPrice(line.price * line.quantity)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <StatusBadge status={line.status} />
              <span>EU {line.size}</span>
              {line.status === "preloved" ? (
                <span>· {CONDITION_LABELS[line.condition]}</span>
              ) : (
                <span>· {formatPrice(line.price)} each</span>
              )}
            </div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <QuantityControl line={line} />
              <button
                type="button"
                onClick={() => remove(line.sku)}
                className="text-xs font-medium text-muted underline underline-offset-2 hover:text-danger"
              >
                Remove<span className="sr-only"> {line.name}</span>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DemoCheckoutNote() {
  return (
    <p className="rounded-md bg-cream px-3 py-2 text-xs leading-relaxed text-muted">
      <strong className="font-semibold text-ink">Demo store.</strong> Checkout
      isn&apos;t connected yet, so no payment is taken and no order is placed.
    </p>
  );
}
