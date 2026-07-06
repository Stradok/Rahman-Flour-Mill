"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { ProductionMixTable } from "@/components/shared/ProductionMixTable";
import { productionMixByBrand, totalBagsProduced } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

export function ProductionMixChart() {
  const { productionLog } = useAppStore();
  const mix = productionMixByBrand(productionLog);
  const total = totalBagsProduced(productionLog);

  return (
    <ClayCard accent="pink" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Production Mix</h2>
        <p className="text-sm text-muted">Bags produced by brand and size.</p>
      </div>

      <ProductionMixTable mix={mix} totalBags={total} />
    </ClayCard>
  );
}
