"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import {
  costLedgerInDateRange,
  financialHealthSummary,
  salesPerformancePeriodRanges,
  transactionsInDateRange,
  type DateRange,
} from "@/lib/calculations";
import { todayDateOnly } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

type Period = "all" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

const PERIOD_LABELS: Record<Period, string> = {
  all: "All Time",
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
  custom: "Custom",
};

export function FinancialHealthCards() {
  const { costLedger, transactions } = useAppStore();
  const ranges = salesPerformancePeriodRanges();

  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState(todayDateOnly);
  const [customTo, setCustomTo] = useState(todayDateOnly);

  const activeRange: DateRange | null =
    period === "all"
      ? null
      : period === "custom"
        ? { from: customFrom, to: customTo }
        : ranges[period];

  const filteredCost = activeRange
    ? costLedgerInDateRange(costLedger, activeRange.from, activeRange.to)
    : costLedger;
  const filteredTx = activeRange
    ? transactionsInDateRange(transactions, activeRange.from, activeRange.to)
    : transactions;

  const summary = financialHealthSummary(filteredCost, filteredTx);

  const isProfitable = summary.netProfit >= 0;
  const costShare =
    summary.totalCost > 0 ? (summary.totalRawMaterialCost / summary.totalCost) * 100 : 0;

  return (
    <ClayCard accent="emerald" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Financial Health</h2>
        <p className="text-sm text-muted">
          {period === "all"
            ? "All-time totals, to date."
            : `Totals for ${PERIOD_LABELS[period]}${
                period === "custom" ? ` (${customFrom} to ${customTo})` : ""
              }.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "daily", "weekly", "monthly", "yearly", "custom"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-[16px] font-heading font-extrabold text-sm transition-all
              ${p === period ? "clay-btn bg-emerald text-white" : "clay-pressed text-muted"}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClayInput
            id="financial-health-from"
            label="From"
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
          <ClayInput
            id="financial-health-till"
            label="Till"
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="clay-pressed rounded-[20px] p-4">
          <span className="text-xs text-muted font-medium">Total Cost</span>
          <div className="font-heading font-black text-xl text-amber">
            Rs {summary.totalCost.toLocaleString()}
          </div>
        </div>
        <div className="clay-pressed rounded-[20px] p-4">
          <span className="text-xs text-muted font-medium">Total Revenue</span>
          <div className="font-heading font-black text-xl text-ink">
            Rs {summary.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="clay-pressed rounded-[20px] p-4">
          <span className="text-xs text-muted font-medium">Net Profit</span>
          <div
            className={`font-heading font-black text-xl ${isProfitable ? "text-emerald" : "text-pink"}`}
          >
            Rs {summary.netProfit.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Raw Material · Rs {summary.totalRawMaterialCost.toLocaleString()}</span>
          <span>Overhead · Rs {summary.totalOverheadCost.toLocaleString()}</span>
        </div>
        <div className="clay-pressed rounded-full h-3 w-full overflow-hidden flex">
          <div className="h-full bg-violet" style={{ width: `${Math.max(costShare, 2)}%` }} />
          <div
            className="h-full bg-amber"
            style={{ width: `${Math.max(100 - costShare, 2)}%` }}
          />
        </div>
        <span className="text-xs text-muted">Cost composition — what makes up Total Cost.</span>
      </div>
    </ClayCard>
  );
}
