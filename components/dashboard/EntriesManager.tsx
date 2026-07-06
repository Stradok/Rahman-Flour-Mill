"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { UndoToast } from "@/components/clay/UndoToast";
import { OVERHEAD_CATEGORY_LABELS } from "@/lib/constants";
import type { CostOverheadEntry, ProductionEntry } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

interface PendingUndo {
  message: string;
  restore: () => void;
}

function EntryRow({
  title,
  subtitle,
  value,
  onRemove,
}: {
  title: string;
  subtitle?: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <div className="clay-card rounded-[16px] px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-heading font-extrabold text-ink truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted truncate">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-heading font-extrabold text-ink">{value}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-pink text-sm font-bold"
          aria-label="Remove entry"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function EntriesManager() {
  const {
    costLedger,
    removeCostEntry,
    restoreCostEntry,
    productionLog,
    removeProductionEntry,
    restoreProductionEntry,
  } = useAppStore();

  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);

  const expenseEntries = costLedger.filter((e) => e.category);
  const wheatEntries = costLedger.filter((e) => e.wheatVolumeKg && e.wheatRatePerKg);

  const handleRemoveCost = (entry: CostOverheadEntry, label: string) => {
    removeCostEntry(entry.id);
    setPendingUndo({
      message: `Removed ${label}`,
      restore: () => restoreCostEntry(entry),
    });
  };

  const handleRemoveProduction = (entry: ProductionEntry) => {
    removeProductionEntry(entry.id);
    setPendingUndo({
      message: `Removed ${entry.brandName} · ${entry.packagingLabel} (${entry.bags} bags)`,
      restore: () => restoreProductionEntry(entry),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ClayCard accent="amber" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Expense Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 1 — Expense.</p>
        </div>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {expenseEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              title={OVERHEAD_CATEGORY_LABELS[entry.category!]}
              subtitle={entry.note}
              value={`Rs ${entry.amount.toLocaleString()}`}
              onRemove={() => handleRemoveCost(entry, OVERHEAD_CATEGORY_LABELS[entry.category!])}
            />
          ))}
          {expenseEntries.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No expenses logged yet.</p>
          )}
        </div>
      </ClayCard>

      <ClayCard accent="violet" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Raw Wheat Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 2 — Raw Wheat.</p>
        </div>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {wheatEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              title={`${entry.wheatVolumeKg}kg @ Rs${entry.wheatRatePerKg}/kg`}
              subtitle={entry.note}
              value={`Rs ${entry.amount.toLocaleString()}`}
              onRemove={() =>
                handleRemoveCost(entry, `${entry.wheatVolumeKg}kg wheat purchase`)
              }
            />
          ))}
          {wheatEntries.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No wheat purchases logged yet.</p>
          )}
        </div>
      </ClayCard>

      <ClayCard accent="pink" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Production Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 3 — Production.</p>
        </div>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {productionLog.map((entry) => (
            <EntryRow
              key={entry.id}
              title={`${entry.brandName} · ${entry.packagingLabel}`}
              subtitle={entry.date}
              value={`${entry.bags.toLocaleString()} bags`}
              onRemove={() => handleRemoveProduction(entry)}
            />
          ))}
          {productionLog.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No production logged yet.</p>
          )}
        </div>
      </ClayCard>

      {pendingUndo && (
        <UndoToast
          message={pendingUndo.message}
          onUndo={() => {
            pendingUndo.restore();
            setPendingUndo(null);
          }}
          onDismiss={() => setPendingUndo(null)}
        />
      )}
    </div>
  );
}
