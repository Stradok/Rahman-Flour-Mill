import { ClayBadge } from "@/components/clay/ClayBadge";
import { formatDateTime } from "@/lib/datetime";
import type { Transaction } from "@/lib/types";

export function LedgerRow({
  tx,
  onRemove,
  onRecordPayment,
  onView,
}: {
  tx: Transaction;
  onRemove?: () => void;
  onRecordPayment?: () => void;
  onView?: () => void;
}) {
  return (
    <div
      onClick={onView}
      className={`clay-card rounded-[22px] p-4 flex items-center justify-between gap-4 ${
        onView ? "cursor-pointer hover:-translate-y-0.5 transition-transform" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-heading font-extrabold text-ink truncate">
          {tx.brandName} · {tx.packagingLabel} × {tx.quantity}
        </span>
        <span className="text-xs text-muted">
          {tx.billNumber} · {formatDateTime(tx.createdAt)}
          {tx.enteredBy ? ` · by ${tx.enteredBy}` : ""}
          {tx.customerName ? ` · ${tx.customerName}` : ""}
        </span>
        {tx.status === "credit-pending" && (tx.creditAmountLeft ?? 0) > 0 && (
          <span className="text-xs text-pink font-medium">
            Rs {tx.creditAmountLeft!.toLocaleString()} still owed
            {tx.customerPhone ? ` · ${tx.customerPhone}` : ""}
          </span>
        )}
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
        {onRecordPayment && tx.status === "credit-pending" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRecordPayment();
            }}
            className="clay-btn bg-emerald text-white font-heading font-extrabold text-xs rounded-[14px] px-3 py-2 whitespace-nowrap hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            Record Payment
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-pink text-sm font-bold"
            aria-label="Remove transaction"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
