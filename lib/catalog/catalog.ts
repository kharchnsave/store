import {
  CONDITIONS,
  DEPARTMENT_ORDER,
  DEPARTMENTS,
  STATUS_LABELS,
  STYLE_LABELS,
} from "./labels";
import { isInStock, slugify } from "./product-utils";
import { PRICE_RANGES, type CatalogQuery } from "./query";
import { fetchPublishedProducts } from "./supabase-catalog";
import type { Product } from "./types";

/*
 * Catalogue data access. Everything that reads inventory goes through these
 * async functions. They read the published catalogue from Supabase (cached,
 * see ./supabase-catalog.ts) and throw if it can't be loaded; there is no
 * fallback data. Search, filters and sorting run here, over the published
 * products, which suits a catalogue of hundreds rather than many thousands.
 */

export async function getAllProducts(): Promise<Product[]> {
  return fetchPublishedProducts();
}

export async function getProductBySlug(slug: string) {
  return (await fetchPublishedProducts()).find((p) => p.slug === slug);
}

export async function getNewestProducts(limit: number, department?: Product["department"]) {
  return sortProducts(
    (await fetchPublishedProducts()).filter((p) => !department || p.department === department),
    "newest",
  ).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return sortProducts(
    (await fetchPublishedProducts()).filter(
      (p) => p.department === product.department && p.id !== product.id,
    ),
    "newest",
  ).slice(0, limit);
}

/** Smallest and largest size stocked for a department, or null if it has none. */
export async function getSizeRange(department: Product["department"]) {
  const sizes = (await fetchPublishedProducts())
    .filter((p) => p.department === department)
    .flatMap((p) => p.variants.map((v) => v.size));
  if (sizes.length === 0) return null;
  return { min: Math.min(...sizes), max: Math.max(...sizes) };
}

/* ---------- Search, filters and facets ---------- */

type FacetKey =
  | "category"
  | "type"
  | "style"
  | "size"
  | "brand"
  | "condition"
  | "price"
  | "stock";

export type FacetOption<V extends string | number = string> = {
  value: V;
  label: string;
  count: number;
};

export type Facets = {
  categories: FacetOption<Product["department"]>[];
  types: FacetOption<Product["status"]>[];
  styles: FacetOption<Product["styles"][number]>[];
  sizes: FacetOption<number>[];
  brands: FacetOption[];
  conditions: FacetOption<Product["condition"]>[];
  prices: FacetOption[];
  inStock: number;
};

const DEPARTMENT_KEYWORDS: Record<Product["department"], string[]> = {
  men: ["men", "mens", "man", "male", "gents"],
  women: ["women", "womens", "woman", "ladies", "female"],
  kids: ["kids", "kid", "children", "child", "boys", "girls", "baby", "toddler"],
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchWords(product: Product) {
  return normalize(
    [
      product.name,
      product.brand,
      product.colour,
      DEPARTMENTS[product.department].label,
      ...DEPARTMENT_KEYWORDS[product.department],
      ...product.styles.map((s) => STYLE_LABELS[s]),
      STATUS_LABELS[product.status],
      product.status === "preloved" ? "preloved used secondhand thrift" : "brand new",
      "shoes",
    ].join(" "),
  ).split(" ");
}

function matchesSearch(product: Product, q: string) {
  const tokens = normalize(q).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const words = searchWords(product);
  // Every search word must prefix-match a word in the listing, so "sneaker"
  // finds "Sneakers" but "men" does not match "women".
  return tokens.every((t) => words.some((w) => w.startsWith(t)));
}

function variantsInSize(product: Product, query: CatalogQuery, ignoreSize: boolean) {
  return ignoreSize || query.sizes.length === 0
    ? product.variants
    : product.variants.filter((v) => query.sizes.includes(v.size));
}

function matches(product: Product, query: CatalogQuery, except?: FacetKey) {
  if (!matchesSearch(product, query.q)) return false;
  if (except !== "category" && query.categories.length && !query.categories.includes(product.department)) return false;
  if (except !== "type" && query.types.length && !query.types.includes(product.status)) return false;
  if (except !== "style" && query.styles.length && !product.styles.some((s) => query.styles.includes(s))) return false;
  if (except !== "brand" && query.brands.length && !query.brands.includes(slugify(product.brand))) return false;
  if (except !== "condition" && query.conditions.length && !query.conditions.includes(product.condition)) return false;
  if (except !== "price" && query.price) {
    const range = PRICE_RANGES.find((r) => r.id === query.price);
    if (range && (product.price < range.min || product.price >= range.max)) return false;
  }
  const variants = variantsInSize(product, query, except === "size");
  if (variants.length === 0) return false;
  if (except !== "stock" && query.inStock && !variants.some((v) => v.stock > 0)) return false;
  return true;
}

export function sortProducts(products: Product[], sort: CatalogQuery["sort"]) {
  return [...products].sort((a, b) => {
    // Sold-out listings stay visible but sink to the end.
    const stock = Number(isInStock(b)) - Number(isInStock(a));
    if (stock !== 0) return stock;
    if (sort === "price-asc" && a.price !== b.price) return a.price - b.price;
    if (sort === "price-desc" && a.price !== b.price) return b.price - a.price;
    return b.listedAt.localeCompare(a.listedAt);
  });
}

function countBy<V extends string | number>(
  products: Product[],
  values: V[],
  test: (product: Product, value: V) => boolean,
  label: (value: V) => string,
): FacetOption<V>[] {
  return values.map((value) => ({
    value,
    label: label(value),
    count: products.filter((p) => test(p, value)).length,
  }));
}

function buildFacets(all: Product[], query: CatalogQuery): Facets {
  const without = (key: FacetKey) => all.filter((p) => matches(p, query, key));

  const sizes = [...new Set(all.flatMap((p) => p.variants.map((v) => v.size)))].sort((a, b) => a - b);
  const brandNames = [...new Set(all.map((p) => p.brand))].sort((a, b) =>
    a === "Unbranded" ? 1 : b === "Unbranded" ? -1 : a.localeCompare(b),
  );
  const brandLabel = new Map(brandNames.map((b) => [slugify(b), b]));

  return {
    categories: countBy(
      without("category"),
      DEPARTMENT_ORDER,
      (p, v) => p.department === v,
      (v) => DEPARTMENTS[v].label,
    ),
    types: countBy(
      without("type"),
      ["preloved", "new"] as Product["status"][],
      (p, v) => p.status === v,
      (v) => STATUS_LABELS[v],
    ),
    styles: countBy(
      without("style"),
      Object.keys(STYLE_LABELS) as Product["styles"],
      (p, v) => p.styles.includes(v),
      (v) => STYLE_LABELS[v],
    ),
    sizes: countBy(
      without("size"),
      sizes,
      (p, v) =>
        p.variants.some(
          (variant) => variant.size === v && (!query.inStock || variant.stock > 0),
        ),
      (v) => `EU ${v}`,
    ),
    brands: countBy(
      without("brand"),
      [...brandLabel.keys()],
      (p, v) => slugify(p.brand) === v,
      (v) => brandLabel.get(v) ?? v,
    ),
    conditions: countBy(
      without("condition"),
      CONDITIONS.map((c) => c.value),
      (p, v) => p.condition === v,
      (v) => CONDITIONS.find((c) => c.value === v)?.label ?? v,
    ),
    prices: countBy(
      without("price"),
      PRICE_RANGES.map((r) => r.id as string),
      (p, v) => {
        const range = PRICE_RANGES.find((r) => r.id === v)!;
        return p.price >= range.min && p.price < range.max;
      },
      (v) => PRICE_RANGES.find((r) => r.id === v)?.label ?? v,
    ),
    inStock: without("stock").filter((p) =>
      variantsInSize(p, query, false).some((v) => v.stock > 0),
    ).length,
  };
}

export async function searchCatalog(query: CatalogQuery) {
  const all = await fetchPublishedProducts();
  const results = sortProducts(
    all.filter((p) => matches(p, query)),
    query.sort,
  );
  return { results, facets: buildFacets(all, query), total: all.length };
}
