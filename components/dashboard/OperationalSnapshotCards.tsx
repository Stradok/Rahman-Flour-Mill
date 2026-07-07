"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayInput } from "@/components/clay/ClayInput";
import {
  GrindedTodayModal,
  ProducedTodayModal,
  StockRemainingModal,
} from "@/components/dashboard/OperationalSnapshotModals";
import { grindingEntriesToday, productionEntriesToday, totalStockRemaining } from "@/lib/calculations";
import { formatDateOnlyLabel, todayDateOnly } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

type OpenModal = "produced" | "grinded" | "stock" | null;

function SnapshotTile({
  label,
  value,
  subValue,
  valueClassName,
  onClick,
}: {
  label: string;
  value: string;
  subValue?: string;
  valueClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="clay-pressed rounded-[20px] p-4 text-left transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <span className="text-xs text-muted font-medium">{label}</span>
      <div className={`font-heading font-black text-xl ${valueClassName}`}>{value}</div>
      {subValue && <div className="text-xs text-muted">{subValue}</div>}
    </button>
  );
}

export function OperationalSnapshotCards() {
  const { productionLog, transactions, grindingLog } = useAppStore();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [selectedDate, setSelectedDate] = useState(todayDateOnly);

  const isToday = selectedDate === todayDateOnly();
  const dateLabel = isToday ? "Today" : formatDateOnlyLabel(selectedDate);

  const produced = productionEntriesToday(productionLog, selectedDate);
  const producedBags = produced.reduce((s, p) => s + p.bags, 0);
  const grinded = grindingEntriesToday(grindingLog, selectedDate);
  const grindedKg = grinded.reduce((s, e) => s + e.wheatGrindedKg, 0);
  const stockRemaining = totalStockRemaining(productionLog, transactions, selectedDate);

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Operational Snapshot</h2>
          <p className="text-sm text-muted">
            What's happening mill-wide. Tap any figure to see the detail behind it, or pick a
            date to look back.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ClayInput
            id="operational-snapshot-date"
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SnapshotTile
          label={`Produced ${dateLabel}`}
          value={`${producedBags.toLocaleString()} bags`}
          valueClassName="text-ink"
          onClick={() => setOpenModal("produced")}
        />
        <SnapshotTile
          label={`Grinded ${dateLabel}`}
          value={`${grindedKg.toLocaleString()} kg`}
          valueClassName="text-sky"
          onClick={() => setOpenModal("grinded")}
        />
        <SnapshotTile
          label={isToday ? "Stock Remaining" : `Stock Remaining (as of ${dateLabel})`}
          value={`${stockRemaining.bags.toLocaleString()} bags`}
          subValue={`${stockRemaining.kg.toLocaleString()} kg`}
          valueClassName="text-emerald"
          onClick={() => setOpenModal("stock")}
        />
      </div>

      {openModal === "produced" && (
        <ProducedTodayModal
          entries={produced}
          title={`Bags Produced${isToday ? " Today" : ` — ${dateLabel}`}`}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "grinded" && (
        <GrindedTodayModal
          entries={grinded}
          title={`Wheat Grinded${isToday ? " Today" : ` — ${dateLabel}`}`}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "stock" && (
        <StockRemainingModal
          productionLog={productionLog}
          transactions={transactions}
          asOfDate={selectedDate}
          subtitle={
            isToday
              ? "Produced minus sold, per brand & size"
              : `Produced minus sold, per brand & size — as of ${dateLabel}`
          }
          onClose={() => setOpenModal(null)}
        />
      )}
    </ClayCard>
  );
}
