"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import {
  productionMixByBrand,
  totalBagsProduced,
  totalProductionWeightKg,
} from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

const BAR_COLORS = ["bg-violet", "bg-pink", "bg-sky", "bg-emerald", "bg-amber"];

export function ProductionMixChart() {
  const { productionLog } = useAppStore();
  const mix = productionMixByBrand(productionLog);
  const total = totalBagsProduced(productionLog);
  const totalWeight = totalProductionWeightKg(productionLog);

  return (
    <ClayCard accent="pink" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Production Mix</h2>
          <p className="text-sm text-muted">Share of bags produced by brand.</p>
        </div>
        <span className="font-heading font-black text-lg text-ink">
          {total.toLocaleString()} bags
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {mix.map((row, i) => (
          <div key={row.brandId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-heading font-extrabold text-ink">{row.brandName}</span>
              <span className="text-muted">
                {row.bags.toLocaleString()} bags · {row.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="clay-pressed rounded-full h-4 w-full overflow-hidden">
              <div
                className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-500`}
                style={{ width: `${Math.max(row.percentage, 2)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                {row.sizes.map((s, j) => (
                  <span key={s.packagingSizeId}>
                    {j > 0 && " · "}
                    {s.packagingLabel}: {s.bags.toLocaleString()}
                  </span>
                ))}
              </span>
              <span className="font-medium text-ink">
                {row.totalWeightKg.toLocaleString()} kg
              </span>
            </div>
          </div>
        ))}
        {mix.length === 0 && (
          <p className="text-sm text-muted text-center py-6">
            No production logged yet — add entries from the Cost &amp; Overhead Ledger.
          </p>
        )}
      </div>

      {mix.length > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-muted/15">
          <span className="text-sm font-medium text-muted">Total Production</span>
          <span className="font-heading font-black text-ink">
            {total.toLocaleString()} bags · {totalWeight.toLocaleString()} kg
          </span>
        </div>
      )}
    </ClayCard>
  );
}
