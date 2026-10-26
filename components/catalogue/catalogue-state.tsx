"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useOptimistic, useTransition } from "react";
import { catalogHref, type CatalogQuery } from "@/lib/catalog/query";

type CatalogueState = {
  /** Current filters, updated optimistically while new results load. */
  query: CatalogQuery;
  isPending: boolean;
  update: (changes: Partial<CatalogQuery>) => void;
};

const CatalogueContext = createContext<CatalogueState | null>(null);

/**
 * Filters are stored in the URL. Changing one replaces the URL, which
 * re-renders the server results; the UI reflects the change immediately.
 */
export function CatalogueStateProvider({
  query,
  children,
}: {
  query: CatalogQuery;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);

  function update(changes: Partial<CatalogQuery>) {
    const next = { ...optimisticQuery, ...changes };
    startTransition(() => {
      setOptimisticQuery(next);
      router.replace(catalogHref(next), { scroll: false });
    });
  }

  return (
    <CatalogueContext value={{ query: optimisticQuery, isPending, update }}>
      {children}
    </CatalogueContext>
  );
}

export function useCatalogue() {
  const context = use(CatalogueContext);
  if (!context) throw new Error("useCatalogue must be used inside <CatalogueStateProvider>");
  return context;
}

export function ResultsRegion({ children }: { children: React.ReactNode }) {
  const { isPending } = useCatalogue();
  return (
    <div
      aria-busy={isPending}
      className={`transition-opacity duration-150 ${isPending ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
