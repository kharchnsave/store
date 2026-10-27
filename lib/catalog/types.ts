export type Department = "men" | "women" | "kids";

export type Style =
  | "sneakers"
  | "running"
  | "casual"
  | "formal"
  | "heels"
  | "boots"
  | "sandals";

/** Whether an item is brand new or has been worn before. */
export type ItemStatus = "new" | "preloved";

export type Condition = "new" | "excellent" | "very-good" | "good";

export type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position used when the photo is cropped to a square. */
  focus?: string;
  /** Close-up of wear or a flaw on a pre-loved pair. */
  showsDefect: boolean;
};

/**
 * A purchasable size. A pre-loved pair is a single variant with stock 0 or 1;
 * new styles can have several sizes, each with its own stock count.
 */
export type ProductVariant = {
  sku: string;
  /** EU size. */
  size: number;
  stock: number;
};

export type Product = {
  /** Database ID (UUID). Not shown to shoppers. */
  id: string;
  /** Human-readable item code shown on the product page, e.g. "PL-M-1001". */
  itemCode: string;
  slug: string;
  name: string;
  brand: string;
  department: Department;
  styles: Style[];
  status: ItemStatus;
  condition: Condition;
  /** Specific wear notes for pre-loved pairs. */
  conditionNotes: string[];
  colour: string;
  /**
   * Price in Pakistani rupees. The database stores paisa (`price_paisa`);
   * lib/catalog/supabase-catalog.ts converts it, and nothing else should.
   */
  price: number;
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  /** ISO date the listing went live, used for "newest" sorting. */
  listedAt: string;
};
