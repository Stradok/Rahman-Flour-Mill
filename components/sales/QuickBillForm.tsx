"use client";

import { useMemo, useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { ClaySelect } from "@/components/clay/ClaySelect";
import { subtotal as calcSubtotal, creditAmountLeft } from "@/lib/calculations";
import { nowDatetimeLocal } from "@/lib/datetime";
import type { PaymentMethod, PaymentMode } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { PaymentSplitFields } from "./PaymentSplitFields";

export function QuickBillForm() {
  const { brands, addTransaction, lastEnteredBy, setLastEnteredBy } = useAppStore();

  const [brandId, setBrandId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerCnic, setCustomerCnic] = useState("");
  const [amountPaid, setAmountPaid] = useState("0");
  const [saleDateTime, setSaleDateTime] = useState(nowDatetimeLocal);
  const [enteredBy, setEnteredBy] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const nameValue = enteredBy || lastEnteredBy;

  const selectedBrand = brands.find((b) => b.id === brandId);
  const selectedSize = selectedBrand?.packagingSizes.find((s) => s.id === sizeId);

  const qty = Number(quantity) || 0;
  const total = useMemo(
    () => calcSubtotal(selectedSize?.basePrice ?? 0, qty),
    [selectedSize, qty]
  );

  const canSubmit =
    !!selectedBrand &&
    !!selectedSize &&
    qty > 0 &&
    (paymentMode === "full" || customerName.trim().length > 0);

  const handleSubmit = () => {
    if (!selectedBrand || !selectedSize || !canSubmit) return;

    const paid = paymentMode === "full" ? total : Number(amountPaid) || 0;
    const left = paymentMode === "credit" ? creditAmountLeft(total, paid) : 0;

    const tx = addTransaction({
      brandId: selectedBrand.id,
      brandName: selectedBrand.name,
      packagingSizeId: selectedSize.id,
      packagingLabel: selectedSize.label,
      weightKg: selectedSize.weightKg,
      unitPrice: selectedSize.basePrice,
      quantity: qty,
      subtotal: total,
      paymentMode,
      paymentMethod: paymentMode === "full" ? paymentMethod : undefined,
      status: paymentMode === "full" || left === 0 ? "paid" : "credit-pending",
      customerName: paymentMode === "credit" ? customerName : undefined,
      customerCnic: paymentMode === "credit" ? customerCnic || undefined : undefined,
      amountPaid: paymentMode === "credit" ? paid : undefined,
      creditAmountLeft: paymentMode === "credit" ? left : undefined,
      createdAt: saleDateTime,
      enteredBy: nameValue || undefined,
    });

    setConfirmation(`Bill ${tx.billNumber} created — Rs ${total.toLocaleString()}`);
    setQuantity("1");
    setCustomerName("");
    setCustomerCnic("");
    setAmountPaid("0");
    setSaleDateTime(nowDatetimeLocal());
    if (nameValue) setLastEnteredBy(nameValue);
    setTimeout(() => setConfirmation(null), 4000);
  };

  return (
    <ClayCard accent="violet" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Quick Bill</h2>
        <p className="text-sm text-muted">Generate a sale in seconds.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ClaySelect
          label="Brand"
          placeholder="Select brand"
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value);
            setSizeId("");
          }}
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
        <ClaySelect
          label="Bag Size"
          placeholder="Select size"
          value={sizeId}
          onChange={(e) => setSizeId(e.target.value)}
          options={(selectedBrand?.packagingSizes ?? []).map((s) => ({
            value: s.id,
            label: `${s.label} — Rs ${s.basePrice.toLocaleString()}`,
          }))}
          disabled={!selectedBrand}
        />
        <ClayInput
          label="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div className="clay-pressed rounded-[20px] px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">Subtotal</span>
        <span className="font-heading font-black text-2xl text-violet">
          Rs {total.toLocaleString()}
        </span>
      </div>

      <div className="flex gap-2">
        {(["full", "credit"] as PaymentMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setPaymentMode(mode)}
            className={`flex-1 px-4 py-3 rounded-[18px] font-heading font-extrabold text-sm transition-all
              ${
                paymentMode === mode
                  ? "clay-btn bg-violet text-white"
                  : "clay-pressed text-muted"
              }`}
          >
            {mode === "full" ? "Full Payment" : "Partial / Credit"}
          </button>
        ))}
      </div>

      {paymentMode === "full" ? (
        <ClaySelect
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          options={[
            { value: "cash", label: "Cash" },
            { value: "digital", label: "Digital / Bank Transfer" },
          ]}
        />
      ) : (
        <PaymentSplitFields
          subtotal={total}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerCnic={customerCnic}
          setCustomerCnic={setCustomerCnic}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          id="sale-datetime"
          label="Date & Time"
          type="datetime-local"
          value={saleDateTime}
          onChange={(e) => setSaleDateTime(e.target.value)}
        />
        <ClayInput
          id="sale-entered-by"
          label="Entered By"
          value={nameValue}
          onChange={(e) => setEnteredBy(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <ClayButton type="button" size="lg" disabled={!canSubmit} onClick={handleSubmit}>
        Confirm Sale
      </ClayButton>

      {confirmation && (
        <p className="text-sm font-medium text-emerald text-center">{confirmation}</p>
      )}
      {brands.length === 0 && (
        <p className="text-sm text-muted text-center">
          No brands configured yet — add one on the Dashboard first.
        </p>
      )}
    </ClayCard>
  );
}
