"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { isToday, todayWheatGrindedKg, totalStockRemaining } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

export function OperationalSnapshotCards() {
  const { productionLog, transactions, grindingLog } = useAppStore();

  const productionTodayBags = productionLog
    .filter((p) => isToday(p.date.slice(0, 10)))
    .reduce((s, p) => s + p.bags, 0);
  const wheatGrindedToday = todayWheatGrindedKg(grindingLog);
  const stockRemaining = totalStockRemaining(productionLog, transactions);

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Operational Snapshot</h2>
        <p className="text-sm text-muted">What's happening right now, mill-wide.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="clay-pressed rounded-[20px] p-4">
          <span className="text-xs text-muted font-medium">Produced Today</span>
          <div className="font-heading font-black text-xl text-ink">
            {productionTodayBags.toLocaleString()} bags
          </div>
        </div>
        <div className="clay-pressed rounded-[20px] p-4">
          <span className="text-xs text-muted font-medium">Grinded Today</span>
          <div className="font-heading font-black text-xl text-sky">
            {wheatGrindedToday.toLocaleString()} kg
          </div>
        </div>
        <div className="clay-pressed rounded-[20px] p-4">
          <span className="text-xs text-muted font-medium">Stock Remaining</span>
          <div className="font-heading font-black text-xl text-emerald">
            {stockRemaining.bags.toLocaleString()} bags
          </div>
          <div className="text-xs text-muted">{stockRemaining.kg.toLocaleString()} kg</div>
        </div>
      </div>
    </ClayCard>
  );
}
