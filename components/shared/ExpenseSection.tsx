"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { OVERHEAD_CATEGORY_LABELS } from "@/lib/constants";
import { totalOverheadCost } from "@/lib/calculations";
import type { OverheadCategory } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

const CATEGORIES = Object.keys(OVERHEAD_CATEGORY_LABELS) as OverheadCategory[];

export function ExpenseSection() {
  const { costLedger, addCostEntry } = useAppStore();

  const [amounts, setAmounts] = useState<Record<OverheadCategory, string>>(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<OverheadCategory, string>
  );
  const [note, setNote] = useState("");

  const total = totalOverheadCost(costLedger);

  const handleSaveAll = () => {
    let savedAny = false;
    for (const category of CATEGORIES) {
      const amt = Number(amounts[category]);
      if (amt > 0) {
        addCostEntry({ category, amount: amt, note });
        savedAny = true;
      }
    }
    if (!savedAny) return;
    setAmounts(Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<OverheadCategory, string>);
    setNote("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-extrabold text-ink">1. Expense</h3>
          <p className="text-xs text-muted">
            Fill in everything for the period (start or end of month) and save once.
          </p>
        </div>
        <div className="clay-pressed rounded-[16px] px-4 py-2 shrink-0">
          <span className="text-xs text-muted font-medium mr-1">Total</span>
          <span className="font-heading font-black text-amber">Rs {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <ClayInput
            key={category}
            label={OVERHEAD_CATEGORY_LABELS[category]}
            type="number"
            suffix="Rs"
            value={amounts[category]}
            onChange={(e) => setAmounts((prev) => ({ ...prev, [category]: e.target.value }))}
          />
        ))}
      </div>

      <ClayInput
        label="Note (optional, applies to this batch)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. July 2026 month-end expenses"
      />

      <ClayButton type="button" variant="secondary" onClick={handleSaveAll} className="self-end">
        Save Expenses
      </ClayButton>

      <p className="text-xs text-muted text-center">
        To view, edit, or remove entries you've already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </div>
  );
}
