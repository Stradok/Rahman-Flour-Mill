"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import {
  GrindedTodayModal,
  ProducedTodayModal,
  StockRemainingModal,
} from "@/components/dashboard/OperationalSnapshotModals";
import { grindingEntriesToday, productionEntriesToday, totalStockRemaining } from "@/lib/calculations";
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

  const producedToday = productionEntriesToday(productionLog);
  const producedTodayBags = producedToday.reduce((s, p) => s + p.bags, 0);
  const grindedToday = grindingEntriesToday(grindingLog);
  const grindedTodayKg = grindedToday.reduce((s, e) => s + e.wheatGrindedKg, 0);
  const stockRemaining = totalStockRemaining(productionLog, transactions);

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Operational Snapshot</h2>
        <p className="text-sm text-muted">
          What's happening right now, mill-wide. Tap any figure to see the detail behind it.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SnapshotTile
          label="Produced Today"
          value={`${producedTodayBags.toLocaleString()} bags`}
          valueClassName="text-ink"
          onClick={() => setOpenModal("produced")}
        />
        <SnapshotTile
          label="Grinded Today"
          value={`${grindedTodayKg.toLocaleString()} kg`}
          valueClassName="text-sky"
          onClick={() => setOpenModal("grinded")}
        />
        <SnapshotTile
          label="Stock Remaining"
          value={`${stockRemaining.bags.toLocaleString()} bags`}
          subValue={`${stockRemaining.kg.toLocaleString()} kg`}
          valueClassName="text-emerald"
          onClick={() => setOpenModal("stock")}
        />
      </div>

      {openModal === "produced" && (
        <ProducedTodayModal entries={producedToday} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "grinded" && (
        <GrindedTodayModal entries={grindedToday} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "stock" && (
        <StockRemainingModal
          productionLog={productionLog}
          transactions={transactions}
          onClose={() => setOpenModal(null)}
        />
      )}
    </ClayCard>
  );
}
