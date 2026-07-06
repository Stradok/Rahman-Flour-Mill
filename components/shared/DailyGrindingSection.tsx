"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { CollapsibleSection } from "@/components/clay/CollapsibleSection";
import { totalWheatGrindedKg, todayWheatGrindedKg } from "@/lib/calculations";
import { nowDatetimeLocal } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

export function DailyGrindingSection() {
  const { grindingLog, addGrindingEntry, lastEnteredBy, setLastEnteredBy } = useAppStore();

  const [wheatGrindedKg, setWheatGrindedKg] = useState("");
  const [note, setNote] = useState("");
  const [entryDateTime, setEntryDateTime] = useState(nowDatetimeLocal);
  const [enteredBy, setEnteredBy] = useState("");

  const total = totalWheatGrindedKg(grindingLog);
  const today = todayWheatGrindedKg(grindingLog);
  const nameValue = enteredBy || lastEnteredBy;

  const handleAdd = () => {
    const kg = Number(wheatGrindedKg);
    if (!kg) return;
    addGrindingEntry({
      date: entryDateTime,
      wheatGrindedKg: kg,
      note,
      enteredBy: nameValue || undefined,
    });
    setWheatGrindedKg("");
    setNote("");
    setEntryDateTime(nowDatetimeLocal());
    if (nameValue) setLastEnteredBy(nameValue);
  };

  return (
    <CollapsibleSection
      icon="4️⃣"
      title="Daily Grinding"
      description="Log the actual wheat grinded — once, at the end of each working day."
      badge={
        <div className="clay-pressed rounded-[16px] px-4 py-2 shrink-0 text-right">
          <div>
            <span className="text-xs text-muted font-medium mr-1">Today</span>
            <span className="font-heading font-black text-sky">
              {today.toLocaleString()} kg
            </span>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between clay-pressed rounded-[16px] px-4 py-2">
        <span className="text-xs text-muted font-medium">All-time Grinded</span>
        <span className="font-heading font-extrabold text-ink">{total.toLocaleString()} kg</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          label="Wheat Grinded"
          type="number"
          suffix="kg"
          value={wheatGrindedKg}
          onChange={(e) => setWheatGrindedKg(e.target.value)}
        />
        <ClayInput
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. End of day total"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClayInput
          id="grinding-datetime"
          label="Date & Time"
          type="datetime-local"
          value={entryDateTime}
          onChange={(e) => setEntryDateTime(e.target.value)}
        />
        <ClayInput
          id="grinding-entered-by"
          label="Entered By"
          value={nameValue}
          onChange={(e) => setEnteredBy(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <ClayButton type="button" variant="secondary" onClick={handleAdd} className="self-end">
        Log Grinding
      </ClayButton>

      <p className="text-xs text-muted text-center">
        To view, edit, or remove entries you&apos;ve already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </CollapsibleSection>
  );
}
