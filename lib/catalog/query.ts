import { CONDITIONS, DEPARTMENT_ORDER, STYLE_LABELS } from "./labels";
import type { Condition, Department, ItemStatus, Style } from "./types";

/**
 * Catalogue search/filter state. It lives in the URL so results can be
 * shared, bookmarked and restored with the back button.
 */
export type SortKey = "newest" | "price-asc" | "price-desc";

export type CatalogQuery = {
  q: string;
  categories: Department[];
  types: ItemStatus[];
  styles: Style[];
  sizes: number[];
  brands: string[];
  conditions: Condition[];
  price: PriceRangeId | null;
  inStock: boolean;
  sort: SortKey;
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low–high" },
  { value: "price-desc", label: "Price: high–low" },
];

export const PRICE_RANGES = [
  { id: "under-3000", label: "Under Rs. 3,000", min: 0, max: 3000 },
  { id: "3000-6000", label: "Rs. 3,000 – 6,000", min: 3000, max: 6000 },
  { id: "6000-10000", label: "Rs. 6,000 – 10,000", min: 6000, max: 10000 },
  { id: "over-10000", label: "Over Rs. 10,000", min: 10000, max: Infinity },
] as const;

export type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

export const EMPTY_QUERY: CatalogQuery = {
  q: "",
  categories: [],
  types: [],
  styles: [],
  sizes: [],
  brands: [],
  conditions: [],
  price: null,
  inStock: false,
  sort: "newest",
};

type RawParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function getAll(params: RawParams, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const value = params[key];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function oneOf<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return [...new Set(values)].filter((v): v is T =>
    (allowed as readonly string[]).includes(v),
  );
}

const STYLES = Object.keys(STYLE_LABELS) as Style[];
const CONDITION_VALUES = CONDITIONS.map((c) => c.value);
const TYPES: ItemStatus[] = ["new", "preloved"];

export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const sort = getAll(params, "sort")[0];
  const price = getAll(params, "price")[0];
  return {
    q: (getAll(params, "q")[0] ?? "").trim().slice(0, 80),
    categories: oneOf(getAll(params, "category"), DEPARTMENT_ORDER),
    types: oneOf(getAll(params, "type"), TYPES),
    styles: oneOf(getAll(params, "style"), STYLES),
    sizes: [...new Set(getAll(params, "size").map(Number))]
      .filter((n) => Number.isFinite(n) && n > 10 && n < 60)
      .sort((a, b) => a - b),
    brands: [...new Set(getAll(params, "brand").map((b) => b.toLowerCase()))],
    conditions: oneOf(getAll(params, "condition"), CONDITION_VALUES),
    price: PRICE_RANGES.some((r) => r.id === price)
      ? (price as PriceRangeId)
      : null,
    inStock: getAll(params, "stock")[0] === "in",
    sort: SORT_OPTIONS.some((o) => o.value === sort)
      ? (sort as SortKey)
      : "newest",
  };
}

export function catalogSearchParams(query: Partial<CatalogQuery>) {
  const full = { ...EMPTY_QUERY, ...query };
  const params = new URLSearchParams();
  if (full.q) params.set("q", full.q);
  full.categories.forEach((v) => params.append("category", v));
  full.types.forEach((v) => params.append("type", v));
  full.styles.forEach((v) => params.append("style", v));
  full.sizes.forEach((v) => params.append("size", String(v)));
  full.brands.forEach((v) => params.append("brand", v));
  full.conditions.forEach((v) => params.append("condition", v));
  if (full.price) params.set("price", full.price);
  if (full.inStock) params.set("stock", "in");
  if (full.sort !== "newest") params.set("sort", full.sort);
  return params;
}

export function catalogHref(query: Partial<CatalogQuery> = {}) {
  const search = catalogSearchParams(query).toString();
  return search ? `/shop?${search}` : "/shop";
}

/** Number of active filters, not counting search text or sort order. */
export function activeFilterCount(query: CatalogQuery) {
  return (
    query.categories.length +
    query.types.length +
    query.styles.length +
    query.sizes.length +
    query.brands.length +
    query.conditions.length +
    (query.price ? 1 : 0) +
    (query.inStock ? 1 : 0)
  );
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}
