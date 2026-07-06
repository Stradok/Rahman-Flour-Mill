"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { UndoToast } from "@/components/clay/UndoToast";
import type { Transaction } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { LedgerRow } from "./LedgerRow";

export function TransactionsLedger() {
  const { transactions, removeTransaction, restoreTransaction } = useAppStore();
  const recent = transactions.slice(0, 15);

  const [pendingUndo, setPendingUndo] = useState<{
    message: string;
    restore: () => void;
  } | null>(null);

  const handleRemove = (tx: Transaction) => {
    removeTransaction(tx.id);
    setPendingUndo({
      message: `Removed ${tx.billNumber} — ${tx.brandName} × ${tx.quantity}`,
      restore: () => restoreTransaction(tx),
    });
  };

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Recent Transactions</h2>
        <p className="text-sm text-muted">Latest sales, newest first.</p>
      </div>

      <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
        {recent.map((tx) => (
          <LedgerRow key={tx.id} tx={tx} onRemove={() => handleRemove(tx)} />
        ))}
        {recent.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No sales recorded yet.</p>
        )}
      </div>

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
    </ClayCard>
  );
}
