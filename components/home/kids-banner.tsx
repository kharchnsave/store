import Image from "next/image";
import Link from "next/link";
import { LongArrowIcon } from "@/components/icons";
import { getSizeRange } from "@/lib/catalog/catalog";
import { DEPARTMENTS } from "@/lib/catalog/labels";

export async function KidsBanner() {
  const sizes = await getSizeRange("kids");

  return (
    <section aria-labelledby="kids-banner-heading" className="container-page pt-12 md:pt-16">
      <div className="grid overflow-hidden rounded-lg bg-lime md:grid-cols-[1fr_1.15fr]">
        <div className="relative aspect-[16/9] md:order-2 md:aspect-auto md:min-h-[340px]">
          <Image
            src="/images/banners/kids-adventures.jpg"
            alt="Child's feet in black sneakers with teal wing details, standing on grass"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
            style={{ objectPosition: "60% 60%" }}
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-7 md:px-10 md:py-10">
          <p className="eyebrow text-forest/80">Kids&apos; New</p>
          <h2
            id="kids-banner-heading"
            className="mt-2 text-3xl font-extrabold leading-[1.05] tracking-tight text-forest md:text-[2.5rem]"
          >
            Little Feet.
            <br />
            Big Adventures.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-forest/85 md:text-[15px]">
            {sizes
              ? `Brand-new kids' shoes in sizes EU ${sizes.min} to ${sizes.max}, with stock shown for every size.`
              : "Brand-new kids' shoes, with stock shown for every size."}
          </p>
          <Link
            href={DEPARTMENTS.kids.href}
            className="btn btn-forest mt-6 w-fit gap-[10px]"
          >
            Shop Kids
            <LongArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
