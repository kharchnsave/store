/**
 * Current availability of a cart line's size, from the published catalogue.
 * "unavailable" means the SKU isn't listed any more (for example a cart
 * saved before the catalogue moved to Supabase). This is a display hint
 * only: checkout must re-check stock and prices on the server.
 */
export type LineAvailability =
  | { status: "available"; stock: number }
  | { status: "sold-out"; stock: 0 }
  | { status: "unavailable" };

export type AvailabilityResponse = { availability: Record<string, LineAvailability> };

export const AVAILABILITY_ENDPOINT = "/api/cart/availability";
export const MAX_AVAILABILITY_SKUS = 50;
