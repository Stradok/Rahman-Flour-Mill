"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { CollapsibleSection } from "@/components/clay/CollapsibleSection";
import { OVERHEAD_CATEGORY_LABELS } from "@/lib/constants";
import { totalOverheadCost } from "@/lib/calculations";
import { nowDatetimeLocal } from "@/lib/datetime";
import type { OverheadCategory } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

const CATEGORIES = Object.keys(OVERHEAD_CATEGORY_LABELS) as OverheadCategory[];

export function ExpenseSection() {
  const { costLedger, addCostEntry, lastEnteredBy, setLastEnteredBy } = useAppStore();

  const [amounts, setAmounts] = useState<Record<OverheadCategory, string>>(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<OverheadCategory, string>
  );
  const [note, setNote] = useState("");
  const [entryDateTime, setEntryDateTime] = useState(nowDatetimeLocal);
  const [enteredBy, setEnteredBy] = useState("");

  const total = totalOverheadCost(costLedger);
  const nameValue = enteredBy || lastEnteredBy;

  const handleSaveAll = () => {
    let savedAny = false;
    for (const category of CATEGORIES) {
      const amt = Number(amounts[category]);
      if (amt > 0) {
        addCostEntry({
          category,
          amount: amt,
          note,
          createdAt: entryDateTime,
          enteredBy: nameValue || undefined,
        });
        savedAny = true;
      }
    }
    if (!savedAny) return;
    setAmounts(Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<OverheadCategory, string>);
    setNote("");
    setEntryDateTime(nowDatetimeLocal());
    if (nameValue) setLastEnteredBy(nameValue);
  };

  return (
    <CollapsibleSection
      icon="1️⃣"
      title="Expense"
      description="Fill in everything for the period (start or end of month) and save once."
      badge={
        <div className="clay-pressed rounded-[16px] px-4 py-2 shrink-0">
          <span className="text-xs text-muted font-medium mr-1">Total</span>
          <span className="font-heading font-black text-amber">Rs {total.toLocaleString()}</span>
        </div>
      }
    >
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          id="expense-datetime"
          label="Date & Time"
          type="datetime-local"
          value={entryDateTime}
          onChange={(e) => setEntryDateTime(e.target.value)}
        />
        <ClayInput
          id="expense-entered-by"
          label="Entered By"
          value={nameValue}
          onChange={(e) => setEnteredBy(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <ClayButton type="button" variant="secondary" onClick={handleSaveAll} className="self-end">
        Save Expenses
      </ClayButton>

      <p className="text-xs text-muted text-center">
        To view, edit, or remove entries you&apos;ve already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </CollapsibleSection>
  );
}
