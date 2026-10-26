import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <div className="container-page py-6 md:py-8">
      <PageHeader
        title="Account"
        intro="Customer accounts aren't available yet. They'll arrive when the store connects to its commerce platform."
      />
      <div className="max-w-2xl rounded-lg bg-cream p-5 text-sm text-ink/85">
        <p>
          You don&apos;t need an account to browse. Your cart is saved on this device,
          so you can come back to it later.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/cart" className="btn btn-forest">
            View cart
          </Link>
          <Link href="/shop" className="btn btn-outline">
            Browse shoes
          </Link>
        </div>
      </div>
    </div>
  );
}
