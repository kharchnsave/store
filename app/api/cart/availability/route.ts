import { getAllProducts } from "@/lib/catalog/catalog";
import {
  MAX_AVAILABILITY_SKUS,
  type AvailabilityResponse,
  type LineAvailability,
} from "@/lib/cart/availability";

/**
 * GET /api/cart/availability?sku=A&sku=B
 *
 * Read-only: reports whether each SKU is still listed and its stock, which
 * product pages already show publicly. Uses the same cached catalogue as the
 * pages, so it can be up to a minute behind; never use it to accept an order.
 */
export async function GET(request: Request) {
  const skus = [...new Set(new URL(request.url).searchParams.getAll("sku"))]
    .filter((sku) => sku.length > 0 && sku.length <= 64)
    .slice(0, MAX_AVAILABILITY_SKUS);

  let products;
  try {
    products = await getAllProducts();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "The catalogue is unavailable." }, { status: 503 });
  }

  const stockBySku = new Map(
    products.flatMap((p) => p.variants.map((v) => [v.sku, v.stock] as const)),
  );
  const availability: Record<string, LineAvailability> = {};
  for (const sku of skus) {
    const stock = stockBySku.get(sku);
    availability[sku] =
      stock === undefined
        ? { status: "unavailable" }
        : stock > 0
          ? { status: "available", stock }
          : { status: "sold-out", stock: 0 };
  }

  return Response.json({ availability } satisfies AvailabilityResponse, {
    headers: { "Cache-Control": "no-store" },
  });
}
