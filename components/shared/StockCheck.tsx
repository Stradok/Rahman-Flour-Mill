"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import { stockByBrandSize } from "@/lib/calculations";
import { formatDateOnlyLabel, todayDateOnly } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

export function StockCheck({ dateSelectable = false }: { dateSelectable?: boolean }) {
  const { productionLog, transactions } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(todayDateOnly);

  const rows = stockByBrandSize(
    productionLog,
    transactions,
    dateSelectable ? selectedDate : undefined
  );
  const isToday = selectedDate === todayDateOnly();

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Check Stock</h2>
          <p className="text-sm text-muted">
            {dateSelectable
              ? `Bags remaining per brand & size, as of ${isToday ? "today" : formatDateOnlyLabel(selectedDate)}.`
              : "Bags remaining per brand & size — produced minus sold."}
          </p>
        </div>
        {dateSelectable && (
          <div className="w-full sm:w-auto">
            <ClayInput
              id="check-stock-date"
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const low = row.stockBags > 0 && row.stockBags <= 10;
          const out = row.stockBags === 0;
          return (
            <div
              key={`${row.brandId}:${row.packagingSizeId}`}
              className="clay-pressed rounded-[18px] px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-heading font-extrabold text-ink truncate">
                  {row.brandName} · {row.packagingLabel}
                </div>
                <div className="text-xs text-muted">
                  Produced {row.producedBags.toLocaleString()} · Sold{" "}
                  {row.soldBags.toLocaleString()}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`font-heading font-black text-lg ${
                    out ? "text-pink" : low ? "text-amber" : "text-emerald"
                  }`}
                >
                  {row.stockBags.toLocaleString()} bags
                </div>
                <div className="text-xs text-muted">{row.stockKg.toLocaleString()} kg</div>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="text-sm text-muted text-center py-4">
            No production or sales logged yet — stock will appear once you have both.
          </p>
        )}
      </div>
    </ClayCard>
  );
}
