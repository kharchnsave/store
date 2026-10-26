import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { catalogHref } from "@/lib/catalog/query";
import { ADULT_SIZES, KIDS_SIZES } from "@/lib/sizes";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "EU, UK and US shoe size conversions for adults and kids, with foot length in centimetres.",
};

const th = "px-3 py-2.5 text-left font-semibold";
const td = "px-3 py-2.5";

export default function SizeGuidePage() {
  return (
    <div className="container-page py-6 md:py-8">
      <PageHeader
        title="Size Guide"
        intro="All sizes on Kharch n Save are listed in EU sizes. Use these tables to convert from UK or US sizes, or measure your foot to find your fit."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section aria-labelledby="adult-sizes">
            <h2 id="adult-sizes" className="text-xl font-bold">
              Adult sizes
            </h2>
            <div className="mt-3 overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[480px] text-sm">
                <caption className="sr-only">
                  Adult shoe size conversions from EU to UK, US men&apos;s and US women&apos;s
                  sizes, with foot length
                </caption>
                <thead className="bg-cream">
                  <tr>
                    <th scope="col" className={th}>EU</th>
                    <th scope="col" className={th}>UK</th>
                    <th scope="col" className={th}>US men</th>
                    <th scope="col" className={th}>US women</th>
                    <th scope="col" className={th}>Foot length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ADULT_SIZES.map((row) => (
                    <tr key={row.eu}>
                      <th scope="row" className={th}>
                        <Link href={catalogHref({ sizes: [row.eu] })} className="link-underline">
                          {row.eu}
                        </Link>
                      </th>
                      <td className={td}>{row.uk}</td>
                      <td className={td}>{row.usMen}</td>
                      <td className={td}>{row.usWomen}</td>
                      <td className={td}>{row.footCm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="kids-sizes-heading" id="kids-sizes" className="scroll-mt-6">
            <h2 id="kids-sizes-heading" className="text-xl font-bold">
              Kids&apos; sizes
            </h2>
            <div className="mt-3 overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[400px] text-sm">
                <caption className="sr-only">
                  Kids&apos; shoe size conversions from EU to UK and US sizes, with foot length
                </caption>
                <thead className="bg-cream">
                  <tr>
                    <th scope="col" className={th}>EU</th>
                    <th scope="col" className={th}>UK</th>
                    <th scope="col" className={th}>US</th>
                    <th scope="col" className={th}>Foot length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {KIDS_SIZES.map((row) => (
                    <tr key={row.eu}>
                      <th scope="row" className={th}>{row.eu}</th>
                      <td className={td}>{row.uk}</td>
                      <td className={td}>{row.us}</td>
                      <td className={td}>{row.footCm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <p className="text-sm text-muted">
            Conversions are approximate. Fit varies between brands and styles, so check
            the size on each listing and compare it with a pair you already own.
          </p>
        </div>

        <aside aria-labelledby="measure-heading" className="h-fit rounded-lg bg-cream p-5">
          <h2 id="measure-heading" className="text-base font-bold">
            How to measure your foot
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/85">
            <li>Stand on a sheet of paper with your heel against a wall.</li>
            <li>Mark the tip of your longest toe on the paper.</li>
            <li>Measure from the wall to the mark in centimetres.</li>
            <li>Measure both feet and use the longer one.</li>
            <li>Match the length to the nearest foot length in the table.</li>
          </ol>
          <p className="mt-3 text-sm text-ink/85">
            Feet are often slightly larger later in the day, so measuring in the evening
            gives a more comfortable fit.
          </p>
        </aside>
      </div>
    </div>
  );
}
