import type { Condition, Department, ItemStatus, Style } from "./types";

export const DEPARTMENTS: Record<
  Department,
  { label: string; possessive: string; title: string; href: string }
> = {
  men: {
    label: "Men",
    possessive: "Men's",
    title: "Men's Pre-Loved Shoes",
    href: "/shop?category=men",
  },
  women: {
    label: "Women",
    possessive: "Women's",
    title: "Women's Pre-Loved Shoes",
    href: "/shop?category=women",
  },
  kids: {
    label: "Kids",
    possessive: "Kids'",
    title: "Kids' New Shoes",
    href: "/shop?category=kids",
  },
};

export const DEPARTMENT_ORDER: Department[] = ["men", "women", "kids"];

export const STYLE_LABELS: Record<Style, string> = {
  sneakers: "Sneakers",
  running: "Running",
  casual: "Casual",
  formal: "Formal",
  heels: "Heels",
  boots: "Boots",
  sandals: "Sandals",
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  new: "New",
  preloved: "Pre-loved",
};

export const CONDITIONS: {
  value: Condition;
  label: string;
  summary: string;
  details: string;
}[] = [
  {
    value: "new",
    label: "New",
    summary: "Unworn, with no signs of use.",
    details:
      "Never worn. Used for brand-new stock such as our kids' range.",
  },
  {
    value: "excellent",
    label: "Excellent",
    summary: "Worn lightly, with minimal signs of wear.",
    details:
      "Uppers are clean, creasing is barely visible and the outsole has plenty of tread left.",
  },
  {
    value: "very-good",
    label: "Very Good",
    summary: "Light wear such as minor creasing or small marks.",
    details:
      "Some creasing, small scuffs or light sole wear that doesn't affect comfort or fit.",
  },
  {
    value: "good",
    label: "Good",
    summary: "Visible wear but fully wearable.",
    details:
      "Noticeable creasing, marks or sole wear, described in the listing's condition notes.",
  },
];

export const CONDITION_LABELS = Object.fromEntries(
  CONDITIONS.map((c) => [c.value, c.label]),
) as Record<Condition, string>;
