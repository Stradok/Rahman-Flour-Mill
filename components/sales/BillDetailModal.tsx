"use client";

import { ClayBadge } from "@/components/clay/ClayBadge";
import { DetailModal } from "@/components/dashboard/DetailModal";
import { formatDateTime } from "@/lib/datetime";
import type { Transaction } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-muted/15 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-heading font-extrabold text-ink text-right">{value}</span>
    </div>
  );
}

export function BillDetailModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  return (
    <DetailModal
      title={tx.billNumber}
      subtitle={formatDateTime(tx.createdAt)}
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {tx.returned && <ClayBadge variant="returned">Returned</ClayBadge>}
          <ClayBadge variant={tx.status === "paid" ? "paid" : "credit"}>
            {tx.status === "paid" ? "Paid" : "Credit Pending"}
          </ClayBadge>
        </div>
        <span className="font-heading font-black text-2xl text-ink">
          Rs {tx.subtotal.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-col">
        <DetailRow label="Brand" value={tx.brandName} />
        <DetailRow label="Bag Size" value={`${tx.packagingLabel} (${tx.weightKg} kg)`} />
        <DetailRow label="Quantity" value={`${tx.quantity} bags`} />
        <DetailRow label="Unit Price" value={`Rs ${tx.unitPrice.toLocaleString()}`} />
        <DetailRow label="Subtotal" value={`Rs ${tx.subtotal.toLocaleString()}`} />
        <DetailRow
          label="Payment Mode"
          value={tx.paymentMode === "full" ? "Full Payment" : "Partial / Credit"}
        />
        {tx.paymentMethod && (
          <DetailRow
            label="Payment Method"
            value={tx.paymentMethod === "cash" ? "Cash" : "Digital / Bank Transfer"}
          />
        )}
        <DetailRow label="Entered By" value={tx.enteredBy ?? "—"} />
      </div>

      {(tx.customerName || tx.customerPhone || tx.customerCnic) && (
        <div className="clay-pressed rounded-[18px] p-4 flex flex-col gap-1">
          <span className="text-xs text-muted font-medium mb-1">Customer Details</span>
          {tx.customerName && <DetailRow label="Name" value={tx.customerName} />}
          {tx.customerPhone && <DetailRow label="Phone" value={tx.customerPhone} />}
          {tx.customerCnic && <DetailRow label="CNIC" value={tx.customerCnic} />}
        </div>
      )}

      {tx.status === "credit-pending" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="clay-pressed rounded-[18px] p-4">
            <span className="text-xs text-muted font-medium">Already Paid</span>
            <div className="font-heading font-black text-lg text-ink">
              Rs {(tx.amountPaid ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="clay-pressed rounded-[18px] p-4">
            <span className="text-xs text-muted font-medium">Still Owed</span>
            <div className="font-heading font-black text-lg text-pink">
              Rs {(tx.creditAmountLeft ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {tx.returned && (
        <div className="clay-pressed rounded-[18px] p-4 flex flex-col gap-1">
          <span className="text-xs text-muted font-medium mb-1">Return Details</span>
          <DetailRow label="Returned At" value={formatDateTime(tx.returnedAt ?? "")} />
          <DetailRow label="Returned By" value={tx.returnedBy ?? "—"} />
          {tx.returnReason && <DetailRow label="Reason" value={tx.returnReason} />}
        </div>
      )}
    </DetailModal>
  );
}
