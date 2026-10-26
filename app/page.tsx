import { CategoryShortcuts } from "@/components/home/category-shortcuts";
import { ComingSoonTeasers } from "@/components/home/coming-soon-teasers";
import { FreshFinds } from "@/components/home/fresh-finds";
import { HelpLinks } from "@/components/home/help-links";
import { Hero } from "@/components/home/hero";
import { KidsBanner } from "@/components/home/kids-banner";
import { SizeShortcuts } from "@/components/home/size-shortcuts";

export default function Home() {
  return (
    <>
      <CategoryShortcuts />
      <Hero />
      <FreshFinds />
      <SizeShortcuts />
      <KidsBanner />
      <HelpLinks />
      <ComingSoonTeasers />
    </>
  );
}
