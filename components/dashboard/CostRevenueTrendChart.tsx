"use client";

import { useState } from "react";
import type { MonthlySummary } from "@/lib/calculations";

const BAR_MAX_HEIGHT = 140;

export function CostRevenueTrendChart({ months }: { months: MonthlySummary[] }) {
  const recent = months.slice(-6);
  const [selected, setSelected] = useState(recent.length - 1);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-8">
        No cost or sales data logged yet — trends will appear once you have at least one
        month of activity.
      </p>
    );
  }

  const maxValue = Math.max(...recent.flatMap((m) => [m.totalCost, m.totalRevenue]), 1);
  const activeIndex = Math.min(Math.max(selected, 0), recent.length - 1);
  const active = recent[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
          <span className="inline-block w-3 h-1.5 rounded-full bg-amber" /> Cost
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
          <span className="inline-block w-3 h-1.5 rounded-full bg-emerald" /> Revenue
        </span>
      </div>

      <div className="clay-pressed rounded-[18px] px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">{active.label}</span>
        <span className="text-sm font-heading font-extrabold text-ink">
          Cost Rs {active.totalCost.toLocaleString()} · Revenue Rs{" "}
          {active.totalRevenue.toLocaleString()}
        </span>
      </div>

      <div className="flex items-end gap-4 overflow-x-auto pb-1" style={{ height: BAR_MAX_HEIGHT + 40 }}>
        {recent.map((m, i) => {
          const costH = Math.max((m.totalCost / maxValue) * BAR_MAX_HEIGHT, m.totalCost > 0 ? 4 : 0);
          const revH = Math.max(
            (m.totalRevenue / maxValue) * BAR_MAX_HEIGHT,
            m.totalRevenue > 0 ? 4 : 0
          );
          return (
            <button
              key={m.monthKey}
              type="button"
              onClick={() => setSelected(i)}
              className={`flex flex-col items-center gap-1.5 shrink-0 px-1 rounded-[10px] transition-all
                ${i === activeIndex ? "bg-canvas" : ""}`}
              style={{ height: BAR_MAX_HEIGHT + 40 }}
              aria-label={`${m.label}: cost Rs ${m.totalCost}, revenue Rs ${m.totalRevenue}`}
            >
              <div className="flex items-end gap-1" style={{ height: BAR_MAX_HEIGHT }}>
                <div className="w-3 rounded-t-[4px] bg-amber" style={{ height: costH }} />
                <div className="w-3 rounded-t-[4px] bg-emerald" style={{ height: revH }} />
              </div>
              <span className="text-[10px] text-muted font-medium whitespace-nowrap">{m.label}</span>
            </button>
          );
        })}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted font-medium select-none">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-3 font-medium">Month</th>
                <th className="py-1 pr-3 font-medium">Cost</th>
                <th className="py-1 pr-3 font-medium">Revenue</th>
                <th className="py-1 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.monthKey} className="text-ink">
                  <td className="py-1 pr-3">{m.label}</td>
                  <td className="py-1 pr-3">Rs {m.totalCost.toLocaleString()}</td>
                  <td className="py-1 pr-3">Rs {m.totalRevenue.toLocaleString()}</td>
                  <td className="py-1">Rs {m.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
