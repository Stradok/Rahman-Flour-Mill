"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { ProductionMixTable } from "@/components/shared/ProductionMixTable";
import { productionInDateRange, productionMixByBrand, totalBagsProduced } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

export function ProductionMixChart() {
  const { productionLog } = useAppStore();

  return (
    <ClayCard accent="pink" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Production Mix</h2>
        <p className="text-sm text-muted">Bags produced by brand and size.</p>
      </div>

      <PeriodFilter idPrefix="production-mix">
        {(range) => {
          const scoped = range
            ? productionInDateRange(productionLog, range.from, range.to)
            : productionLog;
          const mix = productionMixByBrand(scoped);
          const total = totalBagsProduced(scoped);
          return <ProductionMixTable mix={mix} totalBags={total} />;
        }}
      </PeriodFilter>
    </ClayCard>
  );
}
