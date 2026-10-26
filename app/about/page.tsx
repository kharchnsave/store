import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/catalog/labels";

export const metadata: Metadata = {
  title: "About",
  description: "Kharch n Save is a Pakistani store for affordable footwear.",
};

export default function AboutPage() {
  return (
    <div className="container-page py-6 md:py-8">
      <PageHeader title="About Kharch n Save" crumb="About" />
      <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink/85">
        <p className="font-heading text-2xl font-extrabold leading-tight text-forest">
          Style Zyada. <span className="bg-lime px-1">Kharch Kam.</span>
        </p>
        <p>
          Kharch n Save is a Pakistani store for affordable footwear. We sell pre-loved
          shoes for men and women, and brand-new shoes for kids, with prices shown in
          rupees.
        </p>
        <p>
          China-branded shoes and clothing are on the way. You can see what&apos;s
          planned on our{" "}
          <Link href="/coming-soon" className="link-underline">
            Coming Soon
          </Link>{" "}
          page.
        </p>
      </div>
      <ul className="mt-8 flex flex-wrap gap-2">
        {DEPARTMENT_ORDER.map((dept) => (
          <li key={dept}>
            <Link href={DEPARTMENTS[dept].href} className="btn btn-outline">
              {DEPARTMENTS[dept].title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
