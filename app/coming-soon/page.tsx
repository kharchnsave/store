import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/catalog/labels";
import { COMING_SOON } from "@/lib/coming-soon";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "China-branded shoes and clothing are coming soon to Kharch n Save.",
};

export default function ComingSoonPage() {
  return (
    <div className="container-page py-6 md:py-8">
      <PageHeader
        title="Coming Soon"
        intro="New categories we're working on. They aren't available to buy yet."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {COMING_SOON.map((item) => (
          <section
            key={item.id}
            id={item.id}
            aria-labelledby={`${item.id}-heading`}
            className="scroll-mt-6 overflow-hidden rounded-lg border border-line"
          >
            <div className="relative aspect-[3/2] bg-cream">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="eyebrow absolute left-3 top-3 rounded-sm bg-white px-2 py-1 text-[11px] text-ink">
                Coming soon
              </span>
            </div>
            <div className="p-5">
              <h2 id={`${item.id}-heading`} className="text-xl font-bold">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-ink/85">{item.description}</p>
              <p className="mt-3 text-sm font-medium text-muted">Not available to order yet.</p>
            </div>
          </section>
        ))}
      </div>
      <section aria-labelledby="shop-now-heading" className="mt-10 rounded-lg bg-cream p-6">
        <h2 id="shop-now-heading" className="text-lg font-bold">
          Shop what&apos;s available now
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {DEPARTMENT_ORDER.map((dept) => (
            <li key={dept}>
              <Link href={DEPARTMENTS[dept].href} className="btn btn-outline">
                {DEPARTMENTS[dept].title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
