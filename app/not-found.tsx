import Link from "next/link";
import { SearchForm } from "@/components/layout/search-form";

export default function NotFound() {
  return (
    <div className="container-page py-16 text-center">
      <p className="eyebrow text-muted">Page not found</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        This pair has walked off.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or the listing has been
        removed. Try a search or browse the latest finds.
      </p>
      <SearchForm id="not-found-search" className="mx-auto mt-6 max-w-md" />
      <Link href="/shop" className="btn btn-lime mt-6">
        Browse all shoes
      </Link>
    </div>
  );
}
