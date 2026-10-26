import Image from "next/image";
import Link from "next/link";
import { COMING_SOON } from "@/lib/coming-soon";

export function ComingSoonTeasers() {
  return (
    <section aria-labelledby="coming-soon-heading" className="container-page pt-12 md:pt-16">
      <h2 id="coming-soon-heading" className="mb-4 text-lg font-bold md:text-xl">
        Coming soon to Kharch n Save
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {COMING_SOON.map((item) => (
          <li key={item.id}>
            <Link
              href={`/coming-soon#${item.id}`}
              className="group flex h-full overflow-hidden rounded-md border border-line hover:border-forest"
            >
              <span className="relative w-28 shrink-0 bg-cream sm:w-36">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </span>
              <span className="flex flex-col justify-center gap-1 p-4">
                <span className="eyebrow w-fit rounded-sm bg-cream px-1.5 py-0.5 text-[10px] text-muted">
                  Coming soon
                </span>
                <span className="font-heading text-base font-bold">{item.title}</span>
                <span className="text-sm text-muted">{item.teaser}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
