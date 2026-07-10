"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { nowDatetimeLocal } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";
import { TransactionsList } from "./TransactionsList";

export function TransactionsLedger() {
  const { transactions, recordCreditPayment, returnTransaction, logReturn } = useAppStore();

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Recent Transactions</h2>
        <p className="text-sm text-muted">
          Latest sales, newest first. To remove a sale, use the{" "}
          <span className="font-extrabold text-violet">Entries</span> page. Use Record Payment
          once a customer pays off some or all of what they owe.
        </p>
      </div>

      <TransactionsList
        transactions={transactions}
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
        limit={15}
      />
    </ClayCard>
  );
}
