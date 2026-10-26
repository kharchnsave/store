import type { Product } from "./types";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function totalStock(product: Product) {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isInStock(product: Product) {
  return totalStock(product) > 0;
}

export function isOneOff(product: Product) {
  return product.status === "preloved";
}

/** "EU 43" for a single pair, "EU 18–21" for a style with several sizes. */
export function sizeLabel(product: Product) {
  const sizes = product.variants.map((v) => v.size).sort((a, b) => a - b);
  if (sizes.length === 0) return "";
  const first = sizes[0];
  const last = sizes[sizes.length - 1];
  return first === last ? `EU ${first}` : `EU ${first}–${last}`;
}

/** Brand + name for messages and titles, e.g. "Nike Air Force 1 Low — Black". */
export function fullName(item: Pick<Product, "brand" | "name">) {
  return item.brand === "Unbranded" ? item.name : `${item.brand} ${item.name}`;
}

export function productHref(product: Pick<Product, "slug">) {
  return `/products/${product.slug}`;
}
