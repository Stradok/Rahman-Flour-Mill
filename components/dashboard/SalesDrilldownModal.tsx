"use client";

import { useMemo, useState } from "react";
import { ClayBadge } from "@/components/clay/ClayBadge";
import { ClaySelect } from "@/components/clay/ClaySelect";
import { DetailModal } from "@/components/dashboard/DetailModal";
import { formatDateTime } from "@/lib/datetime";
import type { Transaction } from "@/lib/types";

interface SalesDrilldownModalProps {
  title: string;
  subtitle?: string;
  transactions: Transaction[];
  onClose: () => void;
}

export function SalesDrilldownModal({
  title,
  subtitle,
  transactions,
  onClose,
}: SalesDrilldownModalProps) {
  const [brandFilter, setBrandFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "credit-pending">("");

  const brandOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const t of transactions) names.set(t.brandId, t.brandName);
    return [
      { value: "", label: "All brands" },
      ...Array.from(names.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [transactions]);

  const sizeOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const t of transactions) labels.add(t.packagingLabel);
    return [
      { value: "", label: "All sizes" },
      ...Array.from(labels).map((label) => ({ value: label, label })),
    ];
  }, [transactions]);

  const filtered = transactions.filter((t) => {
    if (brandFilter && t.brandId !== brandFilter) return false;
    if (sizeFilter && t.packagingLabel !== sizeFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const totalBags = filtered.reduce((s, t) => s + t.quantity, 0);
  const totalRevenue = filtered.reduce((s, t) => s + t.subtotal, 0);

  return (
    <DetailModal title={title} subtitle={subtitle} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ClaySelect
          id="drilldown-brand-filter"
          label="Filter by Brand"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          options={brandOptions}
        />
        <ClaySelect
          id="drilldown-size-filter"
          label="Filter by Bag Size"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          options={sizeOptions}
        />
        <ClaySelect
          id="drilldown-status-filter"
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "paid" | "credit-pending")}
          options={[
            { value: "", label: "All statuses" },
            { value: "paid", label: "Paid" },
            { value: "credit-pending", label: "Credit" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="clay-pressed rounded-[18px] p-4">
          <span className="text-xs text-muted font-medium">Bags Sold</span>
          <div className="font-heading font-black text-xl text-ink">
            {totalBags.toLocaleString()}
          </div>
        </div>
        <div className="clay-pressed rounded-[18px] p-4">
          <span className="text-xs text-muted font-medium">Revenue</span>
          <div className="font-heading font-black text-xl text-emerald">
            Rs {totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          {transactions.length === 0 ? "No sales in this period." : "No sales match this filter."}
        </p>
      ) : (
        <div className="overflow-y-auto overflow-x-auto flex-1 -mx-1 px-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase tracking-wide sticky top-0 bg-canvas">
                <th className="py-2 pr-3 font-heading font-extrabold">Bill</th>
                <th className="py-2 px-3 font-heading font-extrabold">Brand · Size</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Qty</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Amount</th>
                <th className="py-2 pl-3 font-heading font-extrabold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-muted/15">
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <div className="font-heading font-extrabold text-ink">{t.billNumber}</div>
                    <div className="text-xs text-muted">{formatDateTime(t.createdAt)}</div>
                  </td>
                  <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                    {t.brandName} · {t.packagingLabel}
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink">{t.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-heading font-extrabold text-ink whitespace-nowrap">
                    Rs {t.subtotal.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <ClayBadge variant={t.status === "paid" ? "paid" : "credit"}>
                      {t.status === "paid" ? "Paid" : "Credit"}
                    </ClayBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DetailModal>
  );
}
