"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import { StatFlowCard } from "@/components/clay/StatFlowCard";
import { cumulativeMillStats, millStatsOnDate } from "@/lib/calculations";
import { formatDateOnlyLabel, todayDateOnly } from "@/lib/datetime";
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
  const { costLedger, productionLog, transactions, grindingLog } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(todayDateOnly);

  const isToday = selectedDate === todayDateOnly();
  const dateLabel = isToday ? "Today" : formatDateOnlyLabel(selectedDate);

  const stats = cumulativeMillStats(costLedger, productionLog, transactions, grindingLog, selectedDate);
  const onDate = millStatsOnDate(costLedger, productionLog, transactions, grindingLog, selectedDate);

  return (
    <ClayCard accent="sky" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Mill Operations</h2>
          <p className="text-sm text-muted">
            Wheat Received, Atta Produced, and Atta Issued are calculated automatically from the
            Cost &amp; Overhead Ledger and Sales. Wheat Grinded comes from the Daily Grinding entry
            you log each day. Internal only, separate from the government subsidy program.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ClayInput
            id="mill-ops-date"
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
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
      <p className="text-xs text-muted text-center -mt-2">
        Totals above are cumulative through {dateLabel === "Today" ? "today" : dateLabel}.
      </p>

      <StatFlowCard
        icon={<CalendarIcon />}
        value={`${onDate.wheatGrinded.toLocaleString()} kg`}
        label="Wheat Grinded"
        accent="sky"
        highlighted
        highlightedLabel={dateLabel}
        subMetrics={[
          {
            icon: <GridIcon />,
            label: `Atta Produced (${dateLabel})`,
            value: `${onDate.attaProduced.toLocaleString()} kg`,
          },
          {
            icon: <BoxIcon />,
            label: `Atta Issued (${dateLabel})`,
            value: `${onDate.attaIssued.toLocaleString()} kg`,
          },
        ]}
      />
    </ClayCard>
  );
}
