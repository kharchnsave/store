"use client";

import { catchError, type ErrorInfo } from "next/error";
import { SectionHeading } from "@/components/home/section-heading";

/**
 * Error boundary for a page section that reads the catalogue, so one failed
 * database request doesn't take down the whole page. `quiet` sections (such
 * as a promotional banner) are left out instead of showing an error.
 */
function CatalogueSectionError(
  { id, title, quiet = false }: { id: string; title: string; quiet?: boolean },
  { retry }: ErrorInfo,
) {
  if (quiet) return null;
  return (
    <section aria-labelledby={id} className="container-page pt-10 md:pt-14">
      <SectionHeading id={id} title={title} />
      <div role="alert" className="rounded-lg border border-dashed border-line px-6 py-12 text-center">
        <p className="font-heading text-lg font-bold">We couldn&apos;t load these shoes</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Our product catalogue isn&apos;t responding right now. Please try again in a moment.
        </p>
        <button type="button" onClick={() => retry()} className="btn btn-forest mt-6">
          Try again
        </button>
      </div>
    </section>
  );
}

export const CatalogueSectionBoundary = catchError(CatalogueSectionError);
