import Image from "next/image";
import Link from "next/link";
import { LongArrowIcon } from "@/components/icons";

/**
 * Supplied campaign banner (2172×724). The shoes sit on the right, so the
 * copy overlays the empty left side from md up. On small screens the copy
 * moves to a matching green panel above the uncropped image.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="container-page">
      <div className="surface-dark relative overflow-hidden rounded-lg bg-hero">
        <div className="px-5 pb-5 pt-7 sm:px-8 md:absolute md:inset-y-0 md:left-0 md:z-10 md:flex md:w-[42%] md:flex-col md:justify-center md:p-0 md:pl-[5%]">
          <h1
            id="hero-heading"
            className="text-[2.125rem] font-extrabold leading-[1.04] tracking-tight sm:text-[2.5rem] md:text-[clamp(1.75rem,3.7vw,3.4rem)]"
          >
            <span className="block text-white">Style Zyada.</span>
            <span className="block text-lime">Kharch Kam.</span>
          </h1>
          <p className="mt-2.5 text-[15px] text-white/85 md:mt-[clamp(0.5rem,1vw,1rem)] md:text-[clamp(0.875rem,1.25vw,1.125rem)]">
            More brands. Less to spend.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex h-10 w-fit items-center gap-[10px] rounded-md bg-lime px-4 text-sm font-semibold text-forest hover:bg-lime-hover md:mt-[clamp(1rem,2vw,1.75rem)]"
          >
            Find Your Pair
            <LongArrowIcon />
          </Link>
        </div>
        <Image
          src="/images/hero/kharch-n-save-hero.png"
          alt="Pair of cream leather Nike Air Force 1 sneakers with green Swooshes on a stone plinth against a forest-green wall"
          width={2172}
          height={724}
          preload
          sizes="(min-width: 1320px) 1256px, (min-width: 1024px) calc(100vw - 4rem), (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2rem)"
          className="block h-auto w-full"
        />
      </div>
    </section>
  );
}
