"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { UndoToast } from "@/components/clay/UndoToast";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { LedgerRow } from "@/components/sales/LedgerRow";
import { OVERHEAD_CATEGORY_LABELS } from "@/lib/constants";
import { formatDateTime, nowDatetimeLocal } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

interface PendingUndo {
  message: string;
  restore: () => void;
}

interface PendingDelete {
  summary: string;
  onConfirm: (deletedBy: string, reason: string) => void;
}

function entryMeta(dateTime: string, enteredBy?: string): string {
  return enteredBy ? `${formatDateTime(dateTime)} · by ${enteredBy}` : formatDateTime(dateTime);
}

function EntryRow({
  title,
  meta,
  note,
  value,
  onRemove,
}: {
  title: string;
  meta: string;
  note?: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <div className="clay-card rounded-[16px] px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-heading font-extrabold text-ink truncate">{title}</div>
        <div className="text-xs text-muted truncate">{meta}</div>
        {note && <div className="text-xs text-muted truncate italic">{note}</div>}
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
    grindingLog,
    removeGrindingEntry,
    restoreGrindingEntry,
    transactions,
    removeTransaction,
    restoreTransaction,
    deletionLog,
    logDeletion,
  } = useAppStore();

  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const expenseEntries = costLedger.filter((e) => e.category);
  const wheatEntries = costLedger.filter((e) => e.wheatVolumeKg && e.wheatRatePerKg);

  const requestRemoveCost = (entry: (typeof costLedger)[number], label: string) => {
    const summary = `${label} — Rs ${entry.amount.toLocaleString()}`;
    setPendingDelete({
      summary,
      onConfirm: (deletedBy, reason) => {
        removeCostEntry(entry.id);
        logDeletion({ deletedAt: nowDatetimeLocal(), summary, deletedBy, reason });
        setPendingUndo({ message: `Removed ${label}`, restore: () => restoreCostEntry(entry) });
      },
    });
  };

  const requestRemoveProduction = (entry: (typeof productionLog)[number]) => {
    const summary = `${entry.brandName} · ${entry.packagingLabel} — ${entry.bags} bags`;
    setPendingDelete({
      summary,
      onConfirm: (deletedBy, reason) => {
        removeProductionEntry(entry.id);
        logDeletion({ deletedAt: nowDatetimeLocal(), summary, deletedBy, reason });
        setPendingUndo({
          message: `Removed ${entry.brandName} · ${entry.packagingLabel} (${entry.bags} bags)`,
          restore: () => restoreProductionEntry(entry),
        });
      },
    });
  };

  const requestRemoveGrinding = (entry: (typeof grindingLog)[number]) => {
    const summary = `Wheat Grinded — ${entry.wheatGrindedKg} kg`;
    setPendingDelete({
      summary,
      onConfirm: (deletedBy, reason) => {
        removeGrindingEntry(entry.id);
        logDeletion({ deletedAt: nowDatetimeLocal(), summary, deletedBy, reason });
        setPendingUndo({
          message: `Removed grinding entry (${entry.wheatGrindedKg} kg)`,
          restore: () => restoreGrindingEntry(entry),
        });
      },
    });
  };

  const requestRemoveTransaction = (tx: (typeof transactions)[number]) => {
    const summary = `${tx.billNumber} · ${tx.brandName} · ${tx.packagingLabel} × ${tx.quantity} — Rs ${tx.subtotal.toLocaleString()}`;
    setPendingDelete({
      summary,
      onConfirm: (deletedBy, reason) => {
        removeTransaction(tx.id);
        logDeletion({ deletedAt: nowDatetimeLocal(), summary, deletedBy, reason });
        setPendingUndo({
          message: `Removed ${tx.billNumber} — ${tx.brandName} × ${tx.quantity}`,
          restore: () => restoreTransaction(tx),
        });
      },
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
              meta={entryMeta(entry.createdAt, entry.enteredBy)}
              note={entry.note}
              value={`Rs ${entry.amount.toLocaleString()}`}
              onRemove={() => requestRemoveCost(entry, OVERHEAD_CATEGORY_LABELS[entry.category!])}
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
              meta={entryMeta(entry.createdAt, entry.enteredBy)}
              note={[
                entry.supplierName && `Supplier: ${entry.supplierName}`,
                entry.vehicleNumberPlate && `Vehicle: ${entry.vehicleNumberPlate}`,
                entry.note,
              ]
                .filter(Boolean)
                .join(" · ")}
              value={`Rs ${entry.amount.toLocaleString()}`}
              onRemove={() =>
                requestRemoveCost(
                  entry,
                  `${entry.wheatVolumeKg}kg wheat purchase from ${entry.supplierName ?? "unknown supplier"}`
                )
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
              meta={entryMeta(entry.date, entry.enteredBy)}
              value={`${entry.bags.toLocaleString()} bags`}
              onRemove={() => requestRemoveProduction(entry)}
            />
          ))}
          {productionLog.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No production logged yet.</p>
          )}
        </div>
      </ClayCard>

      <ClayCard accent="sky" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Grinding Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 4 — Daily Grinding.</p>
        </div>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {grindingLog.map((entry) => (
            <EntryRow
              key={entry.id}
              title="Wheat Grinded"
              meta={entryMeta(entry.date, entry.enteredBy)}
              note={entry.note}
              value={`${entry.wheatGrindedKg.toLocaleString()} kg`}
              onRemove={() => requestRemoveGrinding(entry)}
            />
          ))}
          {grindingLog.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No grinding logged yet.</p>
          )}
        </div>
      </ClayCard>

      <ClayCard accent="emerald" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Recent Transactions</h2>
          <p className="text-sm text-muted">
            Every sale. Deleting one here goes through the same name + reason confirmation as
            every other entry below.
          </p>
        </div>
        <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <LedgerRow key={tx.id} tx={tx} onRemove={() => requestRemoveTransaction(tx)} />
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No sales recorded yet.</p>
          )}
        </div>
      </ClayCard>

      <ClayCard className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Deletion Log</h2>
          <p className="text-sm text-muted">
            A permanent record of every entry that&apos;s been deleted above — what it was, who
            deleted it, and why.
          </p>
        </div>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {deletionLog.map((entry) => (
            <div key={entry.id} className="clay-card rounded-[16px] px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-heading font-extrabold text-ink truncate">
                  {entry.summary}
                </span>
                <span className="text-xs text-muted shrink-0">
                  {formatDateTime(entry.deletedAt)}
                </span>
              </div>
              <span className="text-xs text-muted">Deleted by {entry.deletedBy}</span>
              <span className="text-xs text-muted italic">&ldquo;{entry.reason}&rdquo;</span>
            </div>
          ))}
          {deletionLog.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No entries have been deleted yet.</p>
          )}
        </div>
      </ClayCard>

      {pendingDelete && (
        <DeleteConfirmModal
          summary={pendingDelete.summary}
          onCancel={() => setPendingDelete(null)}
          onConfirm={(deletedBy, reason) => {
            pendingDelete.onConfirm(deletedBy, reason);
            setPendingDelete(null);
          }}
        />
      )}

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
