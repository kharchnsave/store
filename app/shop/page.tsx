import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogue, CatalogueSkeleton } from "@/components/catalogue/catalogue";

export const metadata: Metadata = {
  title: "Shop shoes",
  description:
    "Browse pre-loved men's and women's shoes and brand-new kids' shoes. Filter by size, price, brand and condition.",
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="container-page py-6 md:py-8">
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
