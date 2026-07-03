"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { ClaySelect } from "@/components/clay/ClaySelect";
import { OVERHEAD_CATEGORY_LABELS } from "@/lib/constants";
import { totalOverheadCost, totalRawMaterialCost } from "@/lib/calculations";
import type { OverheadCategory } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

type EntryKind = "wheat" | OverheadCategory;

export function CostOverheadLedger() {
  const { costLedger, addCostEntry, removeCostEntry } = useAppStore();

  const [kind, setKind] = useState<EntryKind>("wheat");
  const [wheatVolumeKg, setWheatVolumeKg] = useState("");
  const [wheatRatePerKg, setWheatRatePerKg] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const rawMaterialCost = totalRawMaterialCost(costLedger);
  const overheadCost = totalOverheadCost(costLedger);

  const handleAdd = () => {
    if (kind === "wheat") {
      const vol = Number(wheatVolumeKg);
      const rate = Number(wheatRatePerKg);
      if (!vol || !rate) return;
      addCostEntry({ wheatVolumeKg: vol, wheatRatePerKg: rate, amount: vol * rate, note });
      setWheatVolumeKg("");
      setWheatRatePerKg("");
    } else {
      const amt = Number(amount);
      if (!amt) return;
      addCostEntry({ category: kind, amount: amt, note });
      setAmount("");
    }
    setNote("");
  };

  return (
    <ClayCard accent="amber" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">
          Production Cost & Overhead Ledger
        </h2>
        <p className="text-sm text-muted">Shared between Sales and Dashboard.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="clay-pressed rounded-[18px] px-4 py-3">
          <div className="text-xs text-muted font-medium">Raw Material Cost</div>
          <div className="font-heading font-black text-lg text-violet">
            Rs {rawMaterialCost.toLocaleString()}
          </div>
        </div>
        <div className="clay-pressed rounded-[18px] px-4 py-3">
          <div className="text-xs text-muted font-medium">Overhead Cost</div>
          <div className="font-heading font-black text-lg text-amber">
            Rs {overheadCost.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ClaySelect
          label="Entry Type"
          value={kind}
          onChange={(e) => setKind(e.target.value as EntryKind)}
          options={[
            { value: "wheat", label: "Raw Wheat Intake" },
            ...Object.entries(OVERHEAD_CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />

        {kind === "wheat" ? (
          <div className="grid grid-cols-2 gap-3">
            <ClayInput
              label="Wheat Volume"
              type="number"
              suffix="kg"
              value={wheatVolumeKg}
              onChange={(e) => setWheatVolumeKg(e.target.value)}
            />
            <ClayInput
              label="Rate per kg"
              type="number"
              suffix="Rs"
              value={wheatRatePerKg}
              onChange={(e) => setWheatRatePerKg(e.target.value)}
            />
          </div>
        ) : (
          <ClayInput
            label="Amount"
            type="number"
            suffix="Rs"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        )}

        <ClayInput
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. October fuel bill"
        />

        <ClayButton type="button" variant="secondary" onClick={handleAdd}>
          Add Entry
        </ClayButton>
      </div>

      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
        {costLedger.map((entry) => (
          <div
            key={entry.id}
            className="clay-card rounded-[16px] px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-heading font-extrabold text-ink truncate">
                {entry.category
                  ? OVERHEAD_CATEGORY_LABELS[entry.category]
                  : `Wheat ${entry.wheatVolumeKg}kg @ Rs${entry.wheatRatePerKg}/kg`}
              </div>
              {entry.note && <div className="text-xs text-muted truncate">{entry.note}</div>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-heading font-extrabold text-ink">
                Rs {entry.amount.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => removeCostEntry(entry.id)}
                className="text-pink text-sm font-bold"
                aria-label="Remove entry"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {costLedger.length === 0 && (
          <p className="text-sm text-muted text-center py-4">No cost entries yet.</p>
        )}
      </div>
    </ClayCard>
  );
}
