import { ProductGrid } from "@/components/product/product-card";
import { getNewestProducts } from "@/lib/catalog/catalog";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/catalog/labels";
import { FreshFindsTabs } from "./fresh-finds-tabs";
import { SectionHeading } from "./section-heading";

const PER_TAB = 8;

export async function FreshFinds() {
  const [all, ...byDepartment] = await Promise.all([
    getNewestProducts(PER_TAB),
    ...DEPARTMENT_ORDER.map((dept) => getNewestProducts(PER_TAB, dept)),
  ]);

  const tabs = [
    {
      key: "all",
      label: "All",
      viewAllHref: "/shop",
      viewAllLabel: "View all",
      panel: <ProductGrid products={all} />,
    },
    ...DEPARTMENT_ORDER.map((dept, i) => ({
      key: dept,
      label: DEPARTMENTS[dept].label,
      viewAllHref: DEPARTMENTS[dept].href,
      viewAllLabel: `View all ${DEPARTMENTS[dept].label.toLowerCase()}`,
      panel: <ProductGrid products={byDepartment[i]} />,
    })),
  ];

  return (
    <section aria-labelledby="fresh-finds-heading" className="container-page pt-10 md:pt-14">
      <SectionHeading
        id="fresh-finds-heading"
        title="Fresh Finds"
        description="The latest pre-loved pairs and new kids' styles."
      />
      <FreshFindsTabs tabs={tabs} headingId="fresh-finds-heading" />
    </section>
  );
}
