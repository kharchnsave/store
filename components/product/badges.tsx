import { CONDITION_LABELS, STATUS_LABELS } from "@/lib/catalog/labels";
import type { Condition, ItemStatus } from "@/lib/catalog/types";

export function StatusBadge({
  status,
  className = "",
}: {
  status: ItemStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        status === "new" ? "bg-lime text-forest" : "bg-forest text-white"
      } ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ConditionLabel({ condition }: { condition: Condition }) {
  return (
    <span>
      <span className="text-muted">Condition: </span>
      <span className="font-medium text-ink">{CONDITION_LABELS[condition]}</span>
    </span>
  );
}

export function SoldOutBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink ring-1 ring-line ${className}`}
    >
      Sold out
    </span>
  );
}
