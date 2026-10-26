import Form from "next/form";
import { SearchIcon } from "@/components/icons";

/** Site-wide search. Submits to the catalogue as `/shop?q=…`. */
export function SearchForm({
  id,
  className = "",
  defaultValue,
}: {
  id: string;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <Form action="/shop" role="search" className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search shoes
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search by brand, style or category"
        autoComplete="off"
        enterKeyHint="search"
        className="h-11 w-full rounded-md border border-line bg-cream/60 pl-4 pr-12 text-sm placeholder:text-muted focus:border-forest focus:bg-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest"
      />
      <button
        type="submit"
        className="absolute inset-y-1 right-1 inline-flex w-10 items-center justify-center rounded-[5px] bg-forest text-white hover:bg-forest-deep"
        aria-label="Search"
      >
        <SearchIcon width={18} height={18} />
      </button>
    </Form>
  );
}
