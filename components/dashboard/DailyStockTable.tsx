"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import { dailyStockByBrand, wheatGrindedOnDate } from "@/lib/calculations";
import { todayDateOnly } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

export function DailyStockTable() {
  const { productionLog, transactions, grindingLog } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(todayDateOnly);

  const rows = dailyStockByBrand(productionLog, transactions, selectedDate);
  const grindedThatDay = wheatGrindedOnDate(grindingLog, selectedDate);

  return (
    <ClayCard accent="violet" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Daily Stock</h2>
          <p className="text-sm text-muted">
            Stock movement per brand, in bags, for the selected day.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ClayInput
            id="daily-stock-date"
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="clay-pressed rounded-[16px] px-4 py-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">Wheat Grinded This Day</span>
        <span className="font-heading font-black text-sky">
          {grindedThatDay.toLocaleString()} kg
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          No production or sales logged yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase tracking-wide">
                <th className="py-2 pr-3 font-heading font-extrabold">Brand</th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">
                  Opening Stock
                </th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">
                  Production Today
                </th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">
                  Atta Produced (kg)
                </th>
                <th className="py-2 px-3 font-heading font-extrabold text-right">Sales</th>
                <th className="py-2 pl-3 font-heading font-extrabold text-right">
                  Closing Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.brandId}:${row.packagingSizeId}`} className="border-t border-muted/15">
                  <td className="py-2.5 pr-3 font-heading font-extrabold text-ink whitespace-nowrap">
                    {row.brandName} · {row.packagingLabel}
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink">
                    {row.openingStockBags.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink">
                    {row.productionTodayBags.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted">
                    {(row.productionTodayBags * row.weightKg).toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink">
                    {row.salesTodayBags.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 text-right font-heading font-extrabold text-ink">
                    {row.closingStockBags.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted">
        Wheat Grinded is mill-wide (not split by brand) — logged once per day in the Cost &amp;
        Overhead Ledger.
      </p>
    </ClayCard>
  );
}
