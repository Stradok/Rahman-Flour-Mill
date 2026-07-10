"use client";

import { useMemo, useState } from "react";
import { ClayInput } from "@/components/clay/ClayInput";
import { ClaySelect } from "@/components/clay/ClaySelect";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { BillDetailModal } from "./BillDetailModal";
import { LedgerRow } from "./LedgerRow";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { ReturnConfirmModal } from "./ReturnConfirmModal";

interface TransactionsListProps {
  transactions: Transaction[];
  onRemove?: (tx: Transaction) => void;
  onRecordPayment?: (tx: Transaction, amountReceived: number) => void;
  onReturn?: (tx: Transaction, returnedBy: string, reason: string) => void;
  limit?: number; // cap rows shown when no search/filter is active
  maxHeightClassName?: string;
  emptyMessage?: string;
}

export function TransactionsList({
  transactions,
  onRemove,
  onRecordPayment,
  onReturn,
  limit,
  maxHeightClassName = "max-h-[520px]",
  emptyMessage = "No sales recorded yet.",
}: TransactionsListProps) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TransactionStatus>("");
  const [payingTx, setPayingTx] = useState<Transaction | null>(null);
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [returningTx, setReturningTx] = useState<Transaction | null>(null);

  const hasActiveFilter =
    search.trim() !== "" || dateFrom !== "" || dateTo !== "" || statusFilter !== "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const d = t.createdAt.slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (q) {
        const haystack = [t.billNumber, t.customerName, t.customerCnic, t.customerPhone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, dateFrom, dateTo, statusFilter]);

  const visible = hasActiveFilter || !limit ? filtered : filtered.slice(0, limit);

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ClayInput
          id="transactions-search"
          label="Search"
          placeholder="Bill number, customer name, phone, or CNIC"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ClayInput
          id="transactions-date-from"
          label="From"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <ClayInput
          id="transactions-date-to"
          label="Till"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <ClaySelect
          id="transactions-status-filter"
          label="Payment Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | TransactionStatus)}
          options={[
            { value: "", label: "All" },
            { value: "paid", label: "Paid" },
            { value: "credit-pending", label: "Credit Pending" },
          ]}
        />
      </div>

      {hasActiveFilter && (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </span>
          <button type="button" onClick={clearFilters} className="font-bold text-violet">
            Clear filters
          </button>
        </div>
      )}

      <div className={`flex flex-col gap-3 ${maxHeightClassName} overflow-y-auto pr-1`}>
        {visible.map((tx) => (
          <LedgerRow
            key={tx.id}
            tx={tx}
            onRemove={onRemove ? () => onRemove(tx) : undefined}
            onRecordPayment={onRecordPayment ? () => setPayingTx(tx) : undefined}
            onReturn={onReturn ? () => setReturningTx(tx) : undefined}
            onView={() => setViewingTx(tx)}
          />
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted text-center py-8">
            {hasActiveFilter ? "No transactions match your search." : emptyMessage}
          </p>
        )}
      </div>

      {payingTx && onRecordPayment && (
        <RecordPaymentModal
          tx={payingTx}
          onCancel={() => setPayingTx(null)}
          onConfirm={(amount) => {
            onRecordPayment(payingTx, amount);
            setPayingTx(null);
          }}
        />
      )}

      {viewingTx && <BillDetailModal tx={viewingTx} onClose={() => setViewingTx(null)} />}

      {returningTx && onReturn && (
        <ReturnConfirmModal
          summary={`${returningTx.billNumber} · ${returningTx.brandName} · ${returningTx.packagingLabel} × ${returningTx.quantity} — Rs ${returningTx.subtotal.toLocaleString()}`}
          onCancel={() => setReturningTx(null)}
          onConfirm={(returnedBy, reason) => {
            onReturn(returningTx, returnedBy, reason);
            setReturningTx(null);
          }}
        />
      )}
    </div>
  );
}
