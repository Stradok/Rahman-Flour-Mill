"use client";

import { DetailModal } from "@/components/dashboard/DetailModal";
import { stockByBrandSize } from "@/lib/calculations";
import { formatDateTime } from "@/lib/datetime";
import type { ProductionEntry, Transaction, WheatGrindingLog } from "@/lib/types";

export function ProducedTodayModal({
  entries,
  onClose,
}: {
  entries: ProductionEntry[];
  onClose: () => void;
}) {
  const total = entries.reduce((s, e) => s + e.bags, 0);

  return (
    <DetailModal title="Bags Produced Today" onClose={onClose}>
      <div className="clay-pressed rounded-[18px] p-4 w-fit">
        <span className="text-xs text-muted font-medium">Total Bags</span>
        <div className="font-heading font-black text-xl text-ink">{total.toLocaleString()}</div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">No production logged today.</p>
      ) : (
        <div className="overflow-y-auto overflow-x-auto flex-1 -mx-1 px-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase tracking-wide sticky top-0 bg-canvas">
                <th className="py-2 pr-3 font-heading font-extrabold">Brand · Size</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Bags</th>
                <th className="py-2 px-3 font-heading font-extrabold">Entered By</th>
                <th className="py-2 pl-3 font-heading font-extrabold text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-muted/15">
                  <td className="py-2.5 pr-3 text-ink whitespace-nowrap">
                    {e.brandName} · {e.packagingLabel}
                  </td>
                  <td className="py-2.5 px-3 text-right font-heading font-extrabold text-ink">
                    {e.bags.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                    {e.enteredBy ?? "—"}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-muted whitespace-nowrap">
                    {formatDateTime(e.date)}
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

export function GrindedTodayModal({
  entries,
  onClose,
}: {
  entries: WheatGrindingLog[];
  onClose: () => void;
}) {
  const total = entries.reduce((s, e) => s + e.wheatGrindedKg, 0);

  return (
    <DetailModal title="Wheat Grinded Today" onClose={onClose}>
      <div className="clay-pressed rounded-[18px] p-4 w-fit">
        <span className="text-xs text-muted font-medium">Total Grinded</span>
        <div className="font-heading font-black text-xl text-sky">
          {total.toLocaleString()} kg
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">No grinding logged today.</p>
      ) : (
        <div className="overflow-y-auto overflow-x-auto flex-1 -mx-1 px-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase tracking-wide sticky top-0 bg-canvas">
                <th className="py-2 pr-3 font-heading font-extrabold">Wheat Grinded</th>
                <th className="py-2 px-3 font-heading font-extrabold">Note</th>
                <th className="py-2 px-3 font-heading font-extrabold">Entered By</th>
                <th className="py-2 pl-3 font-heading font-extrabold text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-muted/15">
                  <td className="py-2.5 pr-3 font-heading font-extrabold text-ink whitespace-nowrap">
                    {e.wheatGrindedKg.toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 text-muted truncate max-w-[200px]">
                    {e.note || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                    {e.enteredBy ?? "—"}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-muted whitespace-nowrap">
                    {formatDateTime(e.date)}
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

export function StockRemainingModal({
  productionLog,
  transactions,
  onClose,
}: {
  productionLog: ProductionEntry[];
  transactions: Transaction[];
  onClose: () => void;
}) {
  const rows = stockByBrandSize(productionLog, transactions).filter((r) => r.stockBags > 0);
  const totalBags = rows.reduce((s, r) => s + r.stockBags, 0);
  const totalKg = rows.reduce((s, r) => s + r.stockKg, 0);

  return (
    <DetailModal title="Stock Remaining" subtitle="Produced minus sold, per brand & size" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div className="clay-pressed rounded-[18px] p-4">
          <span className="text-xs text-muted font-medium">Total Bags</span>
          <div className="font-heading font-black text-xl text-ink">
            {totalBags.toLocaleString()}
          </div>
        </div>
        <div className="clay-pressed rounded-[18px] p-4">
          <span className="text-xs text-muted font-medium">Total Weight</span>
          <div className="font-heading font-black text-xl text-emerald">
            {totalKg.toLocaleString()} kg
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">No stock remaining.</p>
      ) : (
        <div className="overflow-y-auto overflow-x-auto flex-1 -mx-1 px-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase tracking-wide sticky top-0 bg-canvas">
                <th className="py-2 pr-3 font-heading font-extrabold">Brand · Size</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Produced</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Sold</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Stock (bags)</th>
                <th className="py-2 pl-3 font-heading font-extrabold text-right">Stock (kg)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.brandId}:${r.packagingSizeId}`} className="border-t border-muted/15">
                  <td className="py-2.5 pr-3 text-ink whitespace-nowrap">
                    {r.brandName} · {r.packagingLabel}
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink">
                    {r.producedBags.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink">
                    {r.soldBags.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-heading font-extrabold text-ink">
                    {r.stockBags.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-muted whitespace-nowrap">
                    {r.stockKg.toLocaleString()} kg
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
