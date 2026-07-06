"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { StatFlowCard } from "@/components/clay/StatFlowCard";
import { cumulativeMillStats, todayMillStats } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

function TruckIcon() {
  return <span>🚚</span>;
}
function GearIcon() {
  return <span>⚙️</span>;
}
function ScaleIcon() {
  return <span>⚖️</span>;
}
function GridIcon() {
  return <span>🧈</span>;
}
function BoxIcon() {
  return <span>📦</span>;
}
function CalendarIcon() {
  return <span>📅</span>;
}

export function MillOperationsStats() {
  const { costLedger, productionLog, transactions } = useAppStore();

  const stats = cumulativeMillStats(costLedger, productionLog, transactions);
  const today = todayMillStats(costLedger, productionLog, transactions);

  return (
    <ClayCard accent="sky" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Mill Operations</h2>
        <p className="text-sm text-muted">
          Calculated automatically from the Cost &amp; Overhead Ledger (Raw Wheat + Production)
          and Sales — nothing to log here manually. Internal only, separate from the government
          subsidy program.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatFlowCard
          icon={<TruckIcon />}
          value={`${stats.wheatReceivedKg.toLocaleString()} kg`}
          label="Total Wheat Received"
          accent="violet"
          subMetrics={[
            {
              icon: <GearIcon />,
              label: "Total Grinded",
              value: `${stats.wheatGrindedKg.toLocaleString()} kg`,
            },
            {
              icon: <ScaleIcon />,
              label: "Stock / Balance",
              value: `${stats.wheatStockBalanceKg.toLocaleString()} kg`,
            },
          ]}
        />
        <StatFlowCard
          icon={<GridIcon />}
          value={`${stats.attaProducedKg.toLocaleString()} kg`}
          label="Atta Produced"
          accent="emerald"
          subMetrics={[
            {
              icon: <BoxIcon />,
              label: "Atta Issued",
              value: `${stats.attaIssuedKg.toLocaleString()} kg`,
            },
            {
              icon: <ScaleIcon />,
              label: "Stock / Balance",
              value: `${stats.attaStockBalanceKg.toLocaleString()} kg`,
            },
          ]}
        />
      </div>

      <StatFlowCard
        icon={<CalendarIcon />}
        value={`${today.wheatGrindedToday.toLocaleString()} kg`}
        label="Wheat Grinded"
        accent="sky"
        highlighted
        subMetrics={[
          {
            icon: <GridIcon />,
            label: "Atta Produced Today",
            value: `${today.attaProducedToday.toLocaleString()} kg`,
          },
          {
            icon: <BoxIcon />,
            label: "Atta Issued Today",
            value: `${today.attaIssuedToday.toLocaleString()} kg`,
          },
        ]}
      />

      <p className="text-xs text-muted -mt-1">
        Note: Wheat Grinded is assumed equal to Atta Produced (1:1) — extraction-rate/wastage
        tracking isn't modeled yet.
      </p>
    </ClayCard>
  );
}
