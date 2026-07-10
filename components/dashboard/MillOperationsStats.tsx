"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import { StatFlowCard } from "@/components/clay/StatFlowCard";
import {
  cumulativeMillStats,
  millStatsInDateRange,
  millStatsOnDate,
} from "@/lib/calculations";
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

type Mode = "asOf" | "range";

export function MillOperationsStats() {
  const { costLedger, productionLog, transactions, grindingLog } = useAppStore();
  const [mode, setMode] = useState<Mode>("asOf");
  const [selectedDate, setSelectedDate] = useState(todayDateOnly);
  const [rangeFrom, setRangeFrom] = useState(todayDateOnly);
  const [rangeTo, setRangeTo] = useState(todayDateOnly);

  const isToday = selectedDate === todayDateOnly();
  const dateLabel = isToday ? "Today" : formatDateOnlyLabel(selectedDate);
  const rangeLabel =
    rangeFrom === rangeTo
      ? formatDateOnlyLabel(rangeFrom)
      : `${formatDateOnlyLabel(rangeFrom)} – ${formatDateOnlyLabel(rangeTo)}`;

  const stats =
    mode === "asOf"
      ? cumulativeMillStats(costLedger, productionLog, transactions, grindingLog, selectedDate)
      : millStatsInDateRange(costLedger, productionLog, transactions, grindingLog, rangeFrom, rangeTo);
  const onDate = millStatsOnDate(costLedger, productionLog, transactions, grindingLog, selectedDate);

  const balanceLabel = mode === "asOf" ? "Stock / Balance" : "Net Change";

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
      </div>

      <div className="flex gap-2">
        {(["asOf", "range"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-[16px] font-heading font-extrabold text-sm transition-all
              ${m === mode ? "clay-btn bg-sky text-white" : "clay-pressed text-muted"}`}
          >
            {m === "asOf" ? "As of Date" : "Date Range"}
          </button>
        ))}
      </div>

      {mode === "asOf" ? (
        <div className="w-full sm:w-auto sm:self-end">
          <ClayInput
            id="mill-ops-date"
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClayInput
            id="mill-ops-range-from"
            label="From"
            type="date"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
          />
          <ClayInput
            id="mill-ops-range-to"
            label="Till"
            type="date"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
          />
        </div>
      )}

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
              label: balanceLabel,
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
              label: balanceLabel,
              value: `${stats.attaStockBalanceKg.toLocaleString()} kg`,
            },
          ]}
        />
      </div>
      <p className="text-xs text-muted text-center -mt-2">
        {mode === "asOf"
          ? `Totals above are cumulative through ${dateLabel === "Today" ? "today" : dateLabel}.`
          : `Totals above are for ${rangeLabel}.`}
      </p>

      {mode === "asOf" && (
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
      )}
    </ClayCard>
  );
}
