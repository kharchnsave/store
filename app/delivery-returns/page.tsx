import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Delivery & Returns",
  description: "Delivery and returns information for Kharch n Save.",
};

export default function DeliveryReturnsPage() {
  return (
    <div className="container-page py-6 md:py-8">
      <PageHeader
        title="Delivery & Returns"
        intro="Our delivery and returns details are being finalised and will be published here before the store starts taking orders."
      />
      <div className="max-w-3xl space-y-8">
        <section aria-labelledby="pending-heading" className="rounded-lg bg-cream p-5">
          <h2 id="pending-heading" className="text-base font-bold">
            What this page will cover
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/85">
            <li>Where we deliver in Pakistan and how delivery is charged</li>
            <li>How long orders take to dispatch and arrive</li>
            <li>Which payment options are available</li>
            <li>Returns and exchanges for pre-loved pairs and new kids&apos; shoes</li>
          </ul>
        </section>
        <p className="text-sm text-muted">
          Until then, this website is a preview and cannot take orders. You can still
          browse, check sizes in the{" "}
          <Link href="/size-guide" className="link-underline">
            size guide
          </Link>{" "}
          and read the{" "}
          <Link href="/condition-guide" className="link-underline">
            condition guide
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
