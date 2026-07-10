"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { UndoToast } from "@/components/clay/UndoToast";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { EntryFilters } from "@/components/dashboard/EntryFilters";
import { TransactionsList } from "@/components/sales/TransactionsList";
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
    recordCreditPayment,
    returnTransaction,
    deletionLog,
    logDeletion,
    returnLog,
    logReturn,
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
        <EntryFilters
          entries={expenseEntries}
          idPrefix="expense"
          searchPlaceholder="Category, note, or entered by"
          getDate={(entry) => entry.createdAt}
          getEnteredBy={(entry) => entry.enteredBy}
          getSearchText={(entry) =>
            [OVERHEAD_CATEGORY_LABELS[entry.category!], entry.note, entry.enteredBy]
              .filter(Boolean)
              .join(" ")
          }
        >
          {(visible) => (
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {visible.map((entry) => (
                <EntryRow
                  key={entry.id}
                  title={OVERHEAD_CATEGORY_LABELS[entry.category!]}
                  meta={entryMeta(entry.createdAt, entry.enteredBy)}
                  note={entry.note}
                  value={`Rs ${entry.amount.toLocaleString()}`}
                  onRemove={() =>
                    requestRemoveCost(entry, OVERHEAD_CATEGORY_LABELS[entry.category!])
                  }
                />
              ))}
              {visible.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  {expenseEntries.length === 0
                    ? "No expenses logged yet."
                    : "No expenses match your search."}
                </p>
              )}
            </div>
          )}
        </EntryFilters>
      </ClayCard>

      <ClayCard accent="violet" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Raw Wheat Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 2 — Raw Wheat.</p>
        </div>
        <EntryFilters
          entries={wheatEntries}
          idPrefix="raw-wheat"
          searchPlaceholder="Supplier, vehicle number, note, or entered by"
          getDate={(entry) => entry.createdAt}
          getEnteredBy={(entry) => entry.enteredBy}
          getSearchText={(entry) =>
            [entry.supplierName, entry.vehicleNumberPlate, entry.note, entry.enteredBy]
              .filter(Boolean)
              .join(" ")
          }
        >
          {(visible) => (
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {visible.map((entry) => (
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
              {visible.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  {wheatEntries.length === 0
                    ? "No wheat purchases logged yet."
                    : "No wheat purchases match your search."}
                </p>
              )}
            </div>
          )}
        </EntryFilters>
      </ClayCard>

      <ClayCard accent="pink" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Production Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 3 — Production.</p>
        </div>
        <EntryFilters
          entries={productionLog}
          idPrefix="production"
          searchPlaceholder="Brand, size, or entered by"
          getDate={(entry) => entry.date}
          getEnteredBy={(entry) => entry.enteredBy}
          getSearchText={(entry) =>
            [entry.brandName, entry.packagingLabel, entry.enteredBy].filter(Boolean).join(" ")
          }
        >
          {(visible) => (
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {visible.map((entry) => (
                <EntryRow
                  key={entry.id}
                  title={`${entry.brandName} · ${entry.packagingLabel}`}
                  meta={entryMeta(entry.date, entry.enteredBy)}
                  value={`${entry.bags.toLocaleString()} bags`}
                  onRemove={() => requestRemoveProduction(entry)}
                />
              ))}
              {visible.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  {productionLog.length === 0
                    ? "No production logged yet."
                    : "No production entries match your search."}
                </p>
              )}
            </div>
          )}
        </EntryFilters>
      </ClayCard>

      <ClayCard accent="sky" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Grinding Entries</h2>
          <p className="text-sm text-muted">Everything logged under Section 4 — Daily Grinding.</p>
        </div>
        <EntryFilters
          entries={grindingLog}
          idPrefix="grinding"
          searchPlaceholder="Note or entered by"
          getDate={(entry) => entry.date}
          getEnteredBy={(entry) => entry.enteredBy}
          getSearchText={(entry) => [entry.note, entry.enteredBy].filter(Boolean).join(" ")}
        >
          {(visible) => (
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {visible.map((entry) => (
                <EntryRow
                  key={entry.id}
                  title="Wheat Grinded"
                  meta={entryMeta(entry.date, entry.enteredBy)}
                  note={entry.note}
                  value={`${entry.wheatGrindedKg.toLocaleString()} kg`}
                  onRemove={() => requestRemoveGrinding(entry)}
                />
              ))}
              {visible.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  {grindingLog.length === 0
                    ? "No grinding logged yet."
                    : "No grinding entries match your search."}
                </p>
              )}
            </div>
          )}
        </EntryFilters>
      </ClayCard>

      <ClayCard accent="emerald" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Recent Transactions</h2>
          <p className="text-sm text-muted">
            Every sale. Deleting one here goes through the same name + reason confirmation as
            every other entry below.
          </p>
        </div>
        <TransactionsList
          transactions={transactions}
          onRemove={requestRemoveTransaction}
          onRecordPayment={(tx, amount) => recordCreditPayment(tx.billNumber, amount)}
          onReturn={(tx, returnedBy, reason) => {
            returnTransaction(tx.id, returnedBy, reason);
            logReturn({
              returnedAt: nowDatetimeLocal(),
              summary: `${tx.billNumber} · ${tx.brandName} · ${tx.packagingLabel} × ${tx.quantity} — Rs ${tx.subtotal.toLocaleString()}`,
              returnedBy,
              reason,
            });
          }}
          maxHeightClassName="max-h-[320px]"
        />
      </ClayCard>

      <ClayCard accent="amber" className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Return Log</h2>
          <p className="text-sm text-muted">
            A permanent record of every sale that&apos;s been returned — what it was, who
            processed the return, and why.
          </p>
        </div>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {returnLog.map((entry) => (
            <div key={entry.id} className="clay-card rounded-[16px] px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-heading font-extrabold text-ink truncate">
                  {entry.summary}
                </span>
                <span className="text-xs text-muted shrink-0">
                  {formatDateTime(entry.returnedAt)}
                </span>
              </div>
              <span className="text-xs text-muted">Returned by {entry.returnedBy}</span>
              <span className="text-xs text-muted italic">&ldquo;{entry.reason}&rdquo;</span>
            </div>
          ))}
          {returnLog.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No sales have been returned yet.</p>
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
