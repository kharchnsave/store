import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page-view";

export const metadata: Metadata = {
  title: "Your cart",
};

export default function CartPage() {
  return (
    <div className="container-page py-8 md:py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight md:text-3xl">Your cart</h1>
      <CartPageView />
    </div>
  );
}
