import type { MonthlySummary } from "@/lib/calculations";
import { percentChange } from "@/lib/calculations";

interface DeltaTileProps {
  label: string;
  value: string;
  deltaPct: number | null;
  goodDirection: "up" | "down";
}

function DeltaTile({ label, value, deltaPct, goodDirection }: DeltaTileProps) {
  const isUp = (deltaPct ?? 0) >= 0;
  const isGood = deltaPct === null ? null : isUp === (goodDirection === "up");
  const color =
    deltaPct === null ? "text-muted" : isGood ? "text-emerald" : "text-pink";

  return (
    <div className="clay-pressed rounded-[18px] px-4 py-3 flex flex-col gap-1">
      <span className="text-xs text-muted font-medium">{label}</span>
      <span className="font-heading font-black text-lg text-ink">{value}</span>
      <span className={`text-xs font-heading font-extrabold ${color}`}>
        {deltaPct === null
          ? "New this month"
          : `${isUp ? "▲" : "▼"} ${Math.abs(deltaPct).toFixed(0)}% vs last month`}
      </span>
    </div>
  );
}

export function MonthComparisonCard({ months }: { months: MonthlySummary[] }) {
  if (months.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-6">
        No data yet to compare months.
      </p>
    );
  }

  const current = months[months.length - 1];
  const previous = months.length > 1 ? months[months.length - 2] : null;

  const costDelta = previous ? percentChange(current.totalCost, previous.totalCost) : null;
  const revenueDelta = previous
    ? percentChange(current.totalRevenue, previous.totalRevenue)
    : null;
  const profitDelta = previous ? percentChange(current.profit, previous.profit) : null;
  const rateDelta = previous
    ? percentChange(current.avgRatePerBag, previous.avgRatePerBag)
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">
          {current.label}
          {previous ? ` vs ${previous.label}` : " (first month of data)"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DeltaTile
          label="Total Cost"
          value={`Rs ${current.totalCost.toLocaleString()}`}
          deltaPct={costDelta}
          goodDirection="down"
        />
        <DeltaTile
          label="Total Revenue"
          value={`Rs ${current.totalRevenue.toLocaleString()}`}
          deltaPct={revenueDelta}
          goodDirection="up"
        />
        <DeltaTile
          label="Profit"
          value={`Rs ${current.profit.toLocaleString()}`}
          deltaPct={profitDelta}
          goodDirection="up"
        />
        <DeltaTile
          label="Avg Rate / Bag"
          value={`Rs ${current.avgRatePerBag.toFixed(0)}`}
          deltaPct={rateDelta}
          goodDirection="up"
        />
      </div>
    </div>
  );
}
