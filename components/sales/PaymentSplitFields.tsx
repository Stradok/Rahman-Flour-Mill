"use client";

import { ClayInput } from "@/components/clay/ClayInput";

interface PaymentSplitFieldsProps {
  subtotal: number;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerCnic: string;
  setCustomerCnic: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  amountPaid: string;
  setAmountPaid: (v: string) => void;
}

export function PaymentSplitFields({
  subtotal,
  customerName,
  setCustomerName,
  customerCnic,
  setCustomerCnic,
  customerPhone,
  setCustomerPhone,
  amountPaid,
  setAmountPaid,
}: PaymentSplitFieldsProps) {
  const paid = Number(amountPaid) || 0;
  const left = Math.max(subtotal - paid, 0);

  return (
    <div className="clay-card rounded-[24px] p-5 flex flex-col gap-4 bg-amber/5">
      <p className="text-sm font-heading font-extrabold text-amber">Credit Sale Details</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          label="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Full name"
        />
        <ClayInput
          label="Phone Number"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="For payment follow-up"
        />
        <ClayInput
          label="CNIC (optional)"
          value={customerCnic}
          onChange={(e) => setCustomerCnic(e.target.value)}
          placeholder="XXXXX-XXXXXXX-X"
        />
        <ClayInput
          label="Amount Paid Now"
          type="number"
          suffix="Rs"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">Credit Amount Left</span>
          <div className="clay-pressed rounded-[20px] px-4 py-3 font-heading font-extrabold text-pink">
            Rs {left.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
