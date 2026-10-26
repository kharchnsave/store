"use client";

import Link from "next/link";
import { useId } from "react";
import type { FacetOption, Facets } from "@/lib/catalog/catalog";
import { toggleValue, type PriceRangeId } from "@/lib/catalog/query";
import { useCatalogue } from "./catalogue-state";

function Fieldset({
  legend,
  aside,
  children,
}: {
  legend: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 first:pt-0">
      <fieldset className="relative">
        <legend className="float-left mb-2.5 w-full font-heading text-sm font-bold">
          {legend}
        </legend>
        {aside ? <div className="absolute right-0 top-0">{aside}</div> : null}
        <div className="clear-both">{children}</div>
      </fieldset>
    </div>
  );
}

function CheckboxList<V extends string>({
  name,
  options,
  selected,
  onToggle,
}: {
  name: string;
  options: FacetOption<V>[];
  selected: V[];
  onToggle: (value: V) => void;
}) {
  const id = useId();
  return (
    <ul className="space-y-1">
      {options.map((option) => {
        const checked = selected.includes(option.value);
        const disabled = option.count === 0 && !checked;
        const inputId = `${id}-${option.value}`;
        return (
          <li key={option.value}>
            <label
              htmlFor={inputId}
              className={`flex items-center gap-2.5 rounded-sm py-1 text-sm ${
                disabled ? "cursor-not-allowed text-muted/60" : "cursor-pointer hover:text-forest"
              }`}
            >
              <input
                id={inputId}
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(option.value)}
                className="size-4 shrink-0 accent-forest"
              />
              <span className="flex-1">{option.label}</span>
              <span className="text-xs text-muted">{option.count}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function SizeGrid({ options }: { options: FacetOption<number>[] }) {
  const { query, update } = useCatalogue();
  const id = useId();
  return (
    <ul className="grid grid-cols-5 gap-1.5">
      {options.map((option) => {
        const checked = query.sizes.includes(option.value);
        const disabled = option.count === 0 && !checked;
        const inputId = `${id}-${option.value}`;
        return (
          <li key={option.value}>
            <input
              id={inputId}
              type="checkbox"
              name="size"
              value={option.value}
              checked={checked}
              disabled={disabled}
              onChange={() =>
                update({
                  sizes: toggleValue(query.sizes, option.value).sort((a, b) => a - b),
                })
              }
              className="peer sr-only"
            />
            <label
              htmlFor={inputId}
              title={`${option.count} ${option.count === 1 ? "item" : "items"}`}
              className="flex h-9 cursor-pointer items-center justify-center rounded-md border border-line text-[13px] font-medium peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest peer-disabled:cursor-not-allowed peer-disabled:border-dashed peer-disabled:text-muted/50 hover:border-forest"
            >
              <span className="sr-only">EU </span>
              {option.value}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function FilterPanel({ facets }: { facets: Facets }) {
  const { query, update } = useCatalogue();
  const priceId = useId();

  return (
    <div className="divide-y divide-line">
      <Fieldset legend="Category">
        <CheckboxList
          name="category"
          options={facets.categories}
          selected={query.categories}
          onToggle={(v) => update({ categories: toggleValue(query.categories, v) })}
        />
      </Fieldset>
      <Fieldset legend="New or pre-loved">
        <CheckboxList
          name="type"
          options={facets.types}
          selected={query.types}
          onToggle={(v) => update({ types: toggleValue(query.types, v) })}
        />
      </Fieldset>
      <Fieldset
        legend="Size (EU)"
        aside={
          <Link href="/size-guide" className="text-xs text-forest link-underline">
            Size guide
          </Link>
        }
      >
        <SizeGrid options={facets.sizes} />
      </Fieldset>
      <Fieldset legend="Price">
        <ul className="space-y-1">
          {[{ value: null, label: "Any price", count: null }, ...facets.prices].map((option) => {
            const inputId = `${priceId}-${option.value ?? "any"}`;
            const checked = query.price === option.value;
            const disabled = option.count === 0 && !checked;
            return (
              <li key={inputId}>
                <label
                  htmlFor={inputId}
                  className={`flex items-center gap-2.5 py-1 text-sm ${
                    disabled ? "cursor-not-allowed text-muted/60" : "cursor-pointer hover:text-forest"
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    // Unique per panel: the desktop and mobile panels can both be in
                    // the DOM, and same-named radios outside a form share one group.
                    name={`price-${priceId}`}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => update({ price: option.value as PriceRangeId | null })}
                    className="size-4 shrink-0 accent-forest"
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.count !== null ? (
                    <span className="text-xs text-muted">{option.count}</span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      </Fieldset>
      <Fieldset legend="Brand">
        <CheckboxList
          name="brand"
          options={facets.brands}
          selected={query.brands}
          onToggle={(v) => update({ brands: toggleValue(query.brands, v) })}
        />
      </Fieldset>
      <Fieldset
        legend="Condition"
        aside={
          <Link href="/condition-guide" className="text-xs text-forest link-underline">
            What do these mean?
          </Link>
        }
      >
        <CheckboxList
          name="condition"
          options={facets.conditions}
          selected={query.conditions}
          onToggle={(v) => update({ conditions: toggleValue(query.conditions, v) })}
        />
      </Fieldset>
      <Fieldset legend="Style">
        <CheckboxList
          name="style"
          options={facets.styles}
          selected={query.styles}
          onToggle={(v) => update({ styles: toggleValue(query.styles, v) })}
        />
      </Fieldset>
      <Fieldset legend="Availability">
        <CheckboxList
          name="stock"
          options={[{ value: "in", label: "In stock only", count: facets.inStock }]}
          selected={query.inStock ? ["in"] : []}
          onToggle={() => update({ inStock: !query.inStock })}
        />
      </Fieldset>
    </div>
  );
}
