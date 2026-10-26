import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/product/badges";
import { PageHeader } from "@/components/layout/page-header";
import { CONDITIONS } from "@/lib/catalog/labels";
import { catalogHref } from "@/lib/catalog/query";

export const metadata: Metadata = {
  title: "Condition Guide",
  description: "How Kharch n Save labels new and pre-loved shoes, and what each condition grade means.",
};

export default function ConditionGuidePage() {
  return (
    <div className="container-page py-6 md:py-8">
      <PageHeader
        title="Condition Guide"
        intro="Every listing is labelled New or Pre-loved and given a condition grade, so you know what to expect before you buy."
      />

      <section aria-labelledby="labels-heading" className="max-w-3xl">
        <h2 id="labels-heading" className="text-xl font-bold">
          New and pre-loved
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line p-4">
            <dt>
              <StatusBadge status="preloved" />
            </dt>
            <dd className="mt-2 text-sm text-ink/85">
              Worn before. Each pre-loved pair is a one-off listing in a single size, with
              its own condition grade and wear notes.
            </dd>
          </div>
          <div className="rounded-lg border border-line p-4">
            <dt>
              <StatusBadge status="new" />
            </dt>
            <dd className="mt-2 text-sm text-ink/85">
              Brand new and unworn. New styles, such as our kids&apos; range, can come in
              several sizes with stock shown for each.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="grades-heading" className="mt-12 max-w-3xl">
        <h2 id="grades-heading" className="text-xl font-bold">
          Condition grades
        </h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[480px] text-sm">
            <caption className="sr-only">Condition grades and what they mean</caption>
            <thead className="bg-cream">
              <tr>
                <th scope="col" className="w-36 px-4 py-3 text-left font-semibold">Grade</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {CONDITIONS.map((c) => (
                <tr key={c.value}>
                  <th scope="row" className="px-4 py-3 text-left align-top font-semibold">
                    <Link href={catalogHref({ conditions: [c.value] })} className="link-underline">
                      {c.label}
                    </Link>
                  </th>
                  <td className="px-4 py-3 align-top text-ink/85">
                    <p className="font-medium text-ink">{c.summary}</p>
                    <p className="mt-0.5">{c.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          Pre-loved listings also include notes on specific wear, such as creasing, marks
          or sole wear, alongside the photos. If anything is unclear, check the notes on
          the product page before adding a pair to your cart.
        </p>
      </section>
    </div>
  );
}
