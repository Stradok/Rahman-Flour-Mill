"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { salesPerformanceSummary, type SalesRollup } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

function PerformanceTile({ label, rollup }: { label: string; rollup: SalesRollup }) {
  return (
    <div className="clay-pressed rounded-[20px] p-4 flex flex-col gap-1">
      <span className="text-xs text-muted font-medium uppercase tracking-wide">{label}</span>
      <span className="font-heading font-black text-xl text-ink">
        {rollup.bags.toLocaleString()} bags
      </span>
      <span className="text-sm font-heading font-extrabold text-emerald">
        Rs {rollup.revenue.toLocaleString()}
      </span>
    </div>
  );
}

export function SalesPerformanceCards() {
  const { transactions } = useAppStore();
  const summary = salesPerformanceSummary(transactions);

  return (
    <ClayCard accent="violet" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Sales Performance</h2>
        <p className="text-sm text-muted">
          Bags sold and revenue, at a glance. Weekly is the trailing 7 days; Monthly and Yearly
          are calendar-to-date.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PerformanceTile label="Today" rollup={summary.daily} />
        <PerformanceTile label="This Week" rollup={summary.weekly} />
        <PerformanceTile label="This Month" rollup={summary.monthly} />
        <PerformanceTile label="This Year" rollup={summary.yearly} />
      </div>
    </ClayCard>
  );
}
