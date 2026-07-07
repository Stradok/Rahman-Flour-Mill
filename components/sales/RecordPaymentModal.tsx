"use client";

import { useEffect, useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import type { Transaction } from "@/lib/types";

interface RecordPaymentModalProps {
  tx: Transaction;
  onConfirm: (amountReceived: number) => void;
  onCancel: () => void;
}

export function RecordPaymentModal({ tx, onConfirm, onCancel }: RecordPaymentModalProps) {
  const remaining = tx.creditAmountLeft ?? tx.subtotal;
  const [amount, setAmount] = useState(String(remaining));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const numericAmount = Number(amount);
  const canConfirm = numericAmount > 0 && numericAmount <= remaining;
  const isFullSettle = numericAmount === remaining;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
      onClick={onCancel}
    >
      <div
        className="clay-card rounded-[32px] p-6 w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Record Payment</h2>
          <p className="text-sm text-muted mt-1">
            {tx.billNumber} · {tx.brandName} · {tx.packagingLabel} × {tx.quantity}
            {tx.customerName ? ` · ${tx.customerName}` : ""}
          </p>
        </div>

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
              Rs {remaining.toLocaleString()}
            </div>
          </div>
        </div>

        <ClayInput
          id="record-payment-amount"
          label="Amount Received Now"
          type="number"
          suffix="Rs"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={
            numericAmount > remaining
              ? `Can't exceed the Rs ${remaining.toLocaleString()} still owed.`
              : undefined
          }
        />

        <p className="text-xs text-muted">
          {numericAmount > remaining
            ? "Enter an amount up to what's still owed."
            : isFullSettle
              ? "This clears the credit in full — the sale will be marked Paid."
              : numericAmount > 0
                ? `This leaves Rs ${(remaining - numericAmount).toLocaleString()} still owed — the sale stays Credit Pending.`
                : "Enter how much the customer is paying right now."}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <ClayButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </ClayButton>
          <ClayButton
            type="button"
            className="!bg-emerald"
            disabled={!canConfirm}
            onClick={() => onConfirm(numericAmount)}
          >
            {isFullSettle ? "Mark as Fully Paid" : "Record Partial Payment"}
          </ClayButton>
        </div>
      </div>
    </div>
  );
}
