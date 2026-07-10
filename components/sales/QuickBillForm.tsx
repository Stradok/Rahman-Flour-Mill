"use client";

import { useMemo, useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayComboBox } from "@/components/clay/ClayComboBox";
import { ClayInput } from "@/components/clay/ClayInput";
import { ClaySelect } from "@/components/clay/ClaySelect";
import { creditAmountLeft, stockByBrandSize } from "@/lib/calculations";
import { nowDatetimeLocal } from "@/lib/datetime";
import type { PaymentMethod, PaymentMode, Transaction } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { PaymentSplitFields } from "./PaymentSplitFields";

interface CartItem {
  key: string; // brandId:sizeId
  brandId: string;
  brandName: string;
  packagingSizeId: string;
  packagingLabel: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
}

export function QuickBillForm() {
  const {
    brands,
    productionLog,
    transactions,
    addTransactionBatch,
    lastEnteredBy,
    setLastEnteredBy,
  } = useAppStore();

  const [brandId, setBrandId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [itemError, setItemError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerCnic, setCustomerCnic] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amountPaid, setAmountPaid] = useState("0");
  const [saleDateTime, setSaleDateTime] = useState(nowDatetimeLocal);
  const [enteredBy, setEnteredBy] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const nameValue = enteredBy || lastEnteredBy;

  const selectedBrand = brands.find((b) => b.id === brandId);
  const selectedSize = selectedBrand?.packagingSizes.find((s) => s.id === sizeId);

  const stockRows = useMemo(
    () => stockByBrandSize(productionLog, transactions),
    [productionLog, transactions]
  );
  const availableFor = (bId: string, sId: string) =>
    stockRows.find((r) => r.brandId === bId && r.packagingSizeId === sId)?.stockBags ?? 0;

  const total = cart.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const qty = Number(quantity) || 0;

  const handleAddItem = () => {
    setItemError(null);
    if (!selectedBrand || !selectedSize || qty <= 0) return;

    const key = `${selectedBrand.id}:${selectedSize.id}`;
    const alreadyInCart = cart.find((c) => c.key === key)?.quantity ?? 0;
    const available = availableFor(selectedBrand.id, selectedSize.id);

    if (alreadyInCart + qty > available) {
      setItemError(
        `Only ${available.toLocaleString()} bags of ${selectedBrand.name} · ${selectedSize.label} in stock` +
          (alreadyInCart > 0 ? ` (${alreadyInCart} already added to this bill).` : ".")
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, quantity: c.quantity + qty } : c));
      }
      return [
        ...prev,
        {
          key,
          brandId: selectedBrand.id,
          brandName: selectedBrand.name,
          packagingSizeId: selectedSize.id,
          packagingLabel: selectedSize.label,
          weightKg: selectedSize.weightKg,
          unitPrice: selectedSize.basePrice,
          quantity: qty,
        },
      ];
    });
    setQuantity("1");
  };

  const removeItem = (key: string) => setCart((prev) => prev.filter((c) => c.key !== key));

  const canSubmit = cart.length > 0 && (paymentMode === "full" || customerName.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const paid = paymentMode === "full" ? total : Number(amountPaid) || 0;
    const left = paymentMode === "credit" ? creditAmountLeft(total, paid) : 0;
    const status = paymentMode === "full" || left === 0 ? "paid" : "credit-pending";

    const items: Omit<Transaction, "id" | "billNumber">[] = cart.map((item) => ({
      createdAt: saleDateTime,
      enteredBy: nameValue || undefined,
      brandId: item.brandId,
      brandName: item.brandName,
      packagingSizeId: item.packagingSizeId,
      packagingLabel: item.packagingLabel,
      weightKg: item.weightKg,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.quantity * item.unitPrice,
      paymentMode,
      paymentMethod: paymentMode === "full" ? paymentMethod : undefined,
      status,
      customerName: paymentMode === "credit" ? customerName : undefined,
      customerCnic: paymentMode === "credit" ? customerCnic || undefined : undefined,
      customerPhone: paymentMode === "credit" ? customerPhone || undefined : undefined,
      amountPaid: paymentMode === "credit" ? paid : undefined,
      creditAmountLeft: paymentMode === "credit" ? left : undefined,
    }));

    const created = await addTransactionBatch(items);
    const billNumber = created[0]?.billNumber ?? "";

    setConfirmation(
      `Bill ${billNumber} created — Rs ${total.toLocaleString()} (${cart.length} item${cart.length === 1 ? "" : "s"})`
    );
    setCart([]);
    setBrandId("");
    setSizeId("");
    setQuantity("1");
    setCustomerName("");
    setCustomerCnic("");
    setCustomerPhone("");
    setAmountPaid("0");
    setSaleDateTime(nowDatetimeLocal());
    if (nameValue) setLastEnteredBy(nameValue);
    setTimeout(() => setConfirmation(null), 5000);
  };

  return (
    <ClayCard accent="violet" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Quick Bill</h2>
        <p className="text-sm text-muted">
          Add one or more items — different brands and sizes are all fine — then confirm the sale
          once.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ClayComboBox
          label="Brand"
          placeholder="Type to search brands..."
          value={brandId}
          onChange={(v) => {
            setBrandId(v);
            setSizeId("");
            setItemError(null);
          }}
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
        <ClayComboBox
          label="Bag Size"
          placeholder={selectedBrand ? "Type to search sizes..." : "Pick a brand first"}
          value={sizeId}
          onChange={(v) => {
            setSizeId(v);
            setItemError(null);
          }}
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
          onChange={(e) => {
            setQuantity(e.target.value);
            setItemError(null);
          }}
        />
      </div>

      {selectedBrand && selectedSize && (
        <p className="text-xs text-muted -mt-2">
          {availableFor(selectedBrand.id, selectedSize.id).toLocaleString()} bags of{" "}
          {selectedBrand.name} · {selectedSize.label} in stock right now.
        </p>
      )}

      {itemError && <p className="text-sm text-pink font-medium -mt-1">{itemError}</p>}

      <ClayButton
        type="button"
        variant="secondary"
        className="self-end"
        disabled={!selectedBrand || !selectedSize || qty <= 0}
        onClick={handleAddItem}
      >
        Add to Bill
      </ClayButton>

      {cart.length > 0 && (
        <div className="flex flex-col gap-2">
          {cart.map((item) => (
            <div
              key={item.key}
              className="clay-pressed rounded-[16px] px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-heading font-extrabold text-ink truncate">
                  {item.brandName} · {item.packagingLabel} × {item.quantity}
                </div>
                <div className="text-xs text-muted">Rs {item.unitPrice.toLocaleString()} each</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-heading font-extrabold text-ink">
                  Rs {(item.quantity * item.unitPrice).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-pink text-sm font-bold"
                  aria-label="Remove item from bill"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="clay-pressed rounded-[20px] px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">Bill Subtotal</span>
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
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
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
