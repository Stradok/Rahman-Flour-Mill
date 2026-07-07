"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import { SalesDrilldownModal } from "@/components/dashboard/SalesDrilldownModal";
import {
  salesInDateRange,
  salesPerformancePeriodRanges,
  salesPerformanceSummary,
  transactionsInDateRange,
  type DateRange,
  type SalesRollup,
} from "@/lib/calculations";
import { todayDateOnly } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

interface Drilldown {
  title: string;
  subtitle: string;
  range: DateRange;
}

function PerformanceTile({
  label,
  rollup,
  onClick,
}: {
  label: string;
  rollup: SalesRollup;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="clay-pressed rounded-[20px] p-4 flex flex-col gap-1 text-left transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <span className="text-xs text-muted font-medium uppercase tracking-wide">{label}</span>
      <span className="font-heading font-black text-2xl text-ink">
        {rollup.bags.toLocaleString()}
      </span>
      <span className="text-xs text-muted -mt-1">bags sold</span>
      <span className="text-sm font-heading font-extrabold text-emerald">
        Rs {rollup.revenue.toLocaleString()}
      </span>
    </button>
  );
}

function formatRangeLabel(range: DateRange): string {
  return range.from === range.to ? range.from : `${range.from} to ${range.to}`;
}

export function SalesPerformanceCards() {
  const { transactions } = useAppStore();
  const summary = salesPerformanceSummary(transactions);
  const ranges = salesPerformancePeriodRanges();

  const [drilldown, setDrilldown] = useState<Drilldown | null>(null);

  const [customFrom, setCustomFrom] = useState(todayDateOnly);
  const [customTo, setCustomTo] = useState(todayDateOnly);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const customRollup = customRange
    ? salesInDateRange(transactions, customRange.from, customRange.to)
    : null;

  const openDrilldown = (title: string, range: DateRange) =>
    setDrilldown({ title, subtitle: formatRangeLabel(range), range });

  return (
    <ClayCard accent="violet" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Sales Performance</h2>
        <p className="text-sm text-muted">
          Bags sold and revenue, at a glance. Weekly is the trailing 7 days; Monthly and Yearly
          are calendar-to-date. Tap any figure to see the sales behind it.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PerformanceTile
          label="Today"
          rollup={summary.daily}
          onClick={() => openDrilldown("Today's Sales", ranges.daily)}
        />
        <PerformanceTile
          label="This Week"
          rollup={summary.weekly}
          onClick={() => openDrilldown("This Week's Sales", ranges.weekly)}
        />
        <PerformanceTile
          label="This Month"
          rollup={summary.monthly}
          onClick={() => openDrilldown("This Month's Sales", ranges.monthly)}
        />
        <PerformanceTile
          label="This Year"
          rollup={summary.yearly}
          onClick={() => openDrilldown("This Year's Sales", ranges.yearly)}
        />
      </div>

      <div className="border-t border-muted/15 pt-4 flex flex-col gap-3">
        <span className="text-sm font-medium text-muted">Custom Range</span>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
          <ClayInput
            id="sales-perf-from"
            label="From"
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
          <ClayInput
            id="sales-perf-till"
            label="Till"
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
          <ClayButton
            type="button"
            variant="secondary"
            className="self-end"
            onClick={() => setCustomRange({ from: customFrom, to: customTo })}
          >
            View
          </ClayButton>
        </div>

        {customRollup && customRange && (
          <PerformanceTile
            label={formatRangeLabel(customRange)}
            rollup={customRollup}
            onClick={() => openDrilldown("Custom Range Sales", customRange)}
          />
        )}
      </div>

      {drilldown && (
        <SalesDrilldownModal
          title={drilldown.title}
          subtitle={drilldown.subtitle}
          transactions={transactionsInDateRange(
            transactions,
            drilldown.range.from,
            drilldown.range.to
          )}
          onClose={() => setDrilldown(null)}
        />
      )}
    </ClayCard>
  );
}
