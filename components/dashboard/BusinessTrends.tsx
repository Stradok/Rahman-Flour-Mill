"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { monthlyBusinessSummary } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";
import { CostRevenueTrendChart } from "./CostRevenueTrendChart";
import { SellingRateTrendChart } from "./SellingRateTrendChart";
import { MonthComparisonCard } from "./MonthComparisonCard";

export function BusinessTrends() {
  const { transactions, costLedger } = useAppStore();
  const months = monthlyBusinessSummary(transactions, costLedger);

  return (
    <div className="flex flex-col gap-6">
      <ClayCard accent="violet" className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Cost vs Revenue Trend</h2>
          <p className="text-sm text-muted">Last 6 months, tap a month to see its numbers.</p>
        </div>
        <CostRevenueTrendChart months={months} />

        <div className="border-t border-muted/15 pt-4">
          <h3 className="font-heading font-extrabold text-ink mb-3">Avg Selling Rate / Bag</h3>
          <SellingRateTrendChart months={months} />
        </div>
      </ClayCard>

      <ClayCard accent="emerald" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Month-over-Month</h2>
          <p className="text-sm text-muted">How this month compares to the last one.</p>
        </div>
        <MonthComparisonCard months={months} />
      </ClayCard>
    </div>
  );
}
