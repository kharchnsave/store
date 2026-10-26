const rupees = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Formats whole Pakistani rupees, e.g. 8500 → "Rs. 8,500". */
export function formatPrice(amount: number) {
  return `Rs. ${rupees.format(amount)}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
