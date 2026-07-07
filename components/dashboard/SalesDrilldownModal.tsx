"use client";

import { ClayBadge } from "@/components/clay/ClayBadge";
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
  const totalBags = transactions.reduce((s, t) => s + t.quantity, 0);
  const totalRevenue = transactions.reduce((s, t) => s + t.subtotal, 0);

  return (
    <DetailModal title={title} subtitle={subtitle} onClose={onClose}>
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

      {transactions.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">No sales in this period.</p>
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
              {transactions.map((t) => (
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
