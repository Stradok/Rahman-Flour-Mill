"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { CollapsibleSection } from "@/components/clay/CollapsibleSection";
import { totalRawMaterialCost } from "@/lib/calculations";
import { nowDatetimeLocal } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

export function RawWheatSection() {
  const { costLedger, addCostEntry, lastEnteredBy, setLastEnteredBy } = useAppStore();

  const [wheatVolumeKg, setWheatVolumeKg] = useState("");
  const [wheatRatePerKg, setWheatRatePerKg] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState("");
  const [note, setNote] = useState("");
  const [entryDateTime, setEntryDateTime] = useState(nowDatetimeLocal);
  const [enteredBy, setEnteredBy] = useState("");

  const total = totalRawMaterialCost(costLedger);
  const nameValue = enteredBy || lastEnteredBy;

  const canSubmit =
    Number(wheatVolumeKg) > 0 &&
    Number(wheatRatePerKg) > 0 &&
    supplierName.trim().length > 0 &&
    vehicleNumberPlate.trim().length > 0;

  const handleAdd = () => {
    if (!canSubmit) return;
    const vol = Number(wheatVolumeKg);
    const rate = Number(wheatRatePerKg);
    addCostEntry({
      wheatVolumeKg: vol,
      wheatRatePerKg: rate,
      supplierName: supplierName.trim(),
      vehicleNumberPlate: vehicleNumberPlate.trim(),
      amount: vol * rate,
      note,
      createdAt: entryDateTime,
      enteredBy: nameValue || undefined,
    });
    setWheatVolumeKg("");
    setWheatRatePerKg("");
    setSupplierName("");
    setVehicleNumberPlate("");
    setNote("");
    setEntryDateTime(nowDatetimeLocal());
    if (nameValue) setLastEnteredBy(nameValue);
  };

  return (
    <CollapsibleSection
      icon="2️⃣"
      title="Raw Wheat"
      description="Log how much wheat you bought and at what rate per kg."
      badge={
        <div className="clay-pressed rounded-[16px] px-4 py-2 shrink-0">
          <span className="text-xs text-muted font-medium mr-1">Total</span>
          <span className="font-heading font-black text-violet">Rs {total.toLocaleString()}</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          id="wheat-supplier-name"
          label="Supplier Name"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="Required"
        />
        <ClayInput
          id="wheat-vehicle-plate"
          label="Vehicle Number Plate"
          value={vehicleNumberPlate}
          onChange={(e) => setVehicleNumberPlate(e.target.value)}
          placeholder="Required"
        />
      </div>

      <ClayInput
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Extra remarks"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          id="wheat-datetime"
          label="Date & Time"
          type="datetime-local"
          value={entryDateTime}
          onChange={(e) => setEntryDateTime(e.target.value)}
        />
        <ClayInput
          id="wheat-entered-by"
          label="Entered By"
          value={nameValue}
          onChange={(e) => setEnteredBy(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <ClayButton
        type="button"
        variant="secondary"
        onClick={handleAdd}
        disabled={!canSubmit}
        className="self-end"
      >
        Add Wheat Purchase
      </ClayButton>

      <p className="text-xs text-muted text-center">
        Supplier Name and Vehicle Number Plate are required for every wheat purchase. To view,
        edit, or remove entries you&apos;ve already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </CollapsibleSection>
  );
}
