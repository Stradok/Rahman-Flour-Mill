"use client";

import { useState, type ReactNode } from "react";
import { ClayInput } from "@/components/clay/ClayInput";
import { salesPerformancePeriodRanges, type DateRange } from "@/lib/calculations";
import { todayDateOnly } from "@/lib/datetime";

type Period = "all" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

const PERIOD_LABELS: Record<Period, string> = {
  all: "All Time",
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
  custom: "Custom",
};

interface PeriodFilterProps {
  idPrefix: string;
  children: (range: DateRange | null, label: string) => ReactNode;
}

export function PeriodFilter({ idPrefix, children }: PeriodFilterProps) {
  const ranges = salesPerformancePeriodRanges();
  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState(todayDateOnly);
  const [customTo, setCustomTo] = useState(todayDateOnly);

  const range: DateRange | null =
    period === "all" ? null : period === "custom" ? { from: customFrom, to: customTo } : ranges[period];

  const label =
    period === "all"
      ? "All Time"
      : period === "custom"
        ? `${customFrom} to ${customTo}`
        : PERIOD_LABELS[period];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["all", "daily", "weekly", "monthly", "yearly", "custom"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-[16px] font-heading font-extrabold text-sm transition-all
              ${p === period ? "clay-btn bg-violet text-white" : "clay-pressed text-muted"}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClayInput
            id={`${idPrefix}-period-from`}
            label="From"
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
          <ClayInput
            id={`${idPrefix}-period-till`}
            label="Till"
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </div>
      )}

      {children(range, label)}
    </div>
  );
}
