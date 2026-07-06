"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { totalRawMaterialCost } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

export function RawWheatSection() {
  const { costLedger, addCostEntry } = useAppStore();

  const [wheatVolumeKg, setWheatVolumeKg] = useState("");
  const [wheatRatePerKg, setWheatRatePerKg] = useState("");
  const [note, setNote] = useState("");

  const total = totalRawMaterialCost(costLedger);

  const handleAdd = () => {
    const vol = Number(wheatVolumeKg);
    const rate = Number(wheatRatePerKg);
    if (!vol || !rate) return;
    addCostEntry({ wheatVolumeKg: vol, wheatRatePerKg: rate, amount: vol * rate, note });
    setWheatVolumeKg("");
    setWheatRatePerKg("");
    setNote("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-extrabold text-ink">2. Raw Wheat</h3>
        <div className="clay-pressed rounded-[16px] px-4 py-2">
          <span className="text-xs text-muted font-medium mr-1">Total</span>
          <span className="font-heading font-black text-violet">Rs {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
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
        <ClayInput
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Supplier name"
        />
      </div>
      <ClayButton type="button" variant="secondary" onClick={handleAdd} className="self-end">
        Add Wheat Purchase
      </ClayButton>

      <p className="text-xs text-muted text-center">
        To view, edit, or remove entries you've already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </div>
  );
}
