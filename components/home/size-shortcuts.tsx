import Link from "next/link";
import { catalogHref } from "@/lib/catalog/query";
import { ADULT_EU_SHORTCUTS } from "@/lib/sizes";
import { SectionHeading } from "./section-heading";

export function SizeShortcuts() {
  return (
    <section aria-labelledby="find-your-fit-heading" className="container-page pt-12 md:pt-16">
      <div className="rounded-lg border border-line bg-cream px-4 py-6 md:px-8 md:py-8">
        <SectionHeading
          id="find-your-fit-heading"
          title="Find your fit"
          description="Shop adult pre-loved pairs by EU size."
          action={
            <Link href="/size-guide" className="text-sm font-semibold text-forest link-underline">
              Not sure? See the size guide
            </Link>
          }
        />
        <ul className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {ADULT_EU_SHORTCUTS.map((size) => (
            <li key={size}>
              <Link
                href={catalogHref({ sizes: [size] })}
                className="flex h-11 items-center justify-center rounded-md border border-line bg-white text-sm font-semibold text-ink hover:border-forest hover:bg-forest hover:text-white"
                aria-label={`EU size ${size}`}
              >
                {size}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
