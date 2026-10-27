"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Shown when a page fails to render, most likely because the product
 * catalogue couldn't be loaded. The header and footer stay in place.
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-16 text-center">
      <p className="eyebrow text-muted">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        We couldn&apos;t load this page.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        Our product catalogue isn&apos;t responding right now. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => retry()} className="btn btn-lime">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
