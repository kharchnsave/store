import type { Metadata } from "next";
import { CheckoutHandoff } from "@/components/cart/checkout-handoff";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 md:py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight md:text-3xl">Checkout</h1>
      <CheckoutHandoff />
    </div>
  );
}
