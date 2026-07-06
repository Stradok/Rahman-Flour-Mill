import { ClayBadge } from "@/components/clay/ClayBadge";
import { formatDateTime } from "@/lib/datetime";
import type { Transaction } from "@/lib/types";

export function LedgerRow({ tx, onRemove }: { tx: Transaction; onRemove: () => void }) {
  return (
    <div className="clay-card rounded-[22px] p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-heading font-extrabold text-ink truncate">
          {tx.brandName} · {tx.packagingLabel} × {tx.quantity}
        </span>
        <span className="text-xs text-muted">
          {tx.billNumber} · {formatDateTime(tx.createdAt)}
          {tx.enteredBy ? ` · by ${tx.enteredBy}` : ""}
          {tx.customerName ? ` · ${tx.customerName}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="font-heading font-black text-ink">
            Rs {tx.subtotal.toLocaleString()}
          </span>
          <ClayBadge variant={tx.status === "paid" ? "paid" : "credit"}>
            {tx.status === "paid" ? "Paid" : "Credit Pending"}
          </ClayBadge>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-pink text-sm font-bold"
          aria-label="Remove transaction"
        >
          ×
        </button>
      </div>
    </div>
  );
}
