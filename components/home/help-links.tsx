import Link from "next/link";
import { ChevronRightIcon, RulerIcon, TagIcon, TruckIcon } from "@/components/icons";

const LINKS = [
  {
    title: "Size Guide",
    text: "EU, UK and US conversions for adults and kids.",
    href: "/size-guide",
    Icon: RulerIcon,
  },
  {
    title: "Condition Guide",
    text: "What New, Excellent, Very Good and Good mean.",
    href: "/condition-guide",
    Icon: TagIcon,
  },
  {
    title: "Delivery & Returns",
    text: "How delivery and returns will work.",
    href: "/delivery-returns",
    Icon: TruckIcon,
  },
];

export function HelpLinks() {
  return (
    <section aria-labelledby="help-heading" className="container-page pt-12 md:pt-16">
      <h2 id="help-heading" className="sr-only">
        Shopping help
      </h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {LINKS.map(({ title, text, href, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full items-center gap-4 rounded-md border border-line p-4 hover:border-forest"
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-forest-soft text-forest">
                <Icon width={22} height={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[15px] font-bold">{title}</span>
                <span className="block text-sm text-muted">{text}</span>
              </span>
              <ChevronRightIcon className="shrink-0 text-muted group-hover:text-forest" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
