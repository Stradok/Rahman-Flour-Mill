"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { useAppStore } from "@/store/AppStore";
import { LedgerRow } from "./LedgerRow";

export function TransactionsLedger() {
  const { transactions } = useAppStore();
  const recent = transactions.slice(0, 15);

  return (
    <ClayCard accent="sky" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Recent Transactions</h2>
        <p className="text-sm text-muted">
          Latest sales, newest first. To remove a sale, use the{" "}
          <span className="font-extrabold text-violet">Entries</span> page.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
        {recent.map((tx) => (
          <LedgerRow key={tx.id} tx={tx} />
        ))}
        {recent.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No sales recorded yet.</p>
        )}
      </div>
    </ClayCard>
  );
}
