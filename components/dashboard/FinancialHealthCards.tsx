"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { financialHealthSummary } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

export function FinancialHealthCards() {
  const { costLedger, transactions } = useAppStore();
  const summary = financialHealthSummary(costLedger, transactions);

  const isProfitable = summary.netProfit >= 0;
  const costShare =
    summary.totalCost > 0 ? (summary.totalRawMaterialCost / summary.totalCost) * 100 : 0;

  return (
    <ClayCard accent="emerald" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Financial Health</h2>
        <p className="text-sm text-muted">All-time totals, to date.</p>
      </div>

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
