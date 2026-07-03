"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { StatFlowCard } from "@/components/clay/StatFlowCard";
import {
  cumulativeAttaStats,
  cumulativeWheatStats,
  todayWheatAttaStats,
} from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

function TruckIcon() {
  return <span>🚚</span>;
}
function GearIcon() {
  return <span>⚙️</span>;
}
function ScaleIcon() {
  return <span>⚖️</span>;
}
function GridIcon() {
  return <span>🧈</span>;
}
function BoxIcon() {
  return <span>📦</span>;
}
function CalendarIcon() {
  return <span>📅</span>;
}

export function MillOperationsStats() {
  const { wheatLog, addWheatLogEntry } = useAppStore();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [wheatReceivedKg, setWheatReceivedKg] = useState("");
  const [wheatGrindedKg, setWheatGrindedKg] = useState("");
  const [attaProducedKg, setAttaProducedKg] = useState("");
  const [attaIssuedKg, setAttaIssuedKg] = useState("");

  const wheatStats = cumulativeWheatStats(wheatLog);
  const attaStats = cumulativeAttaStats(wheatLog);
  const today = todayWheatAttaStats(wheatLog);

  const handleLog = () => {
    const grinded = Number(wheatGrindedKg) || 0;
    const produced = Number(attaProducedKg) || 0;
    const issued = Number(attaIssuedKg) || 0;
    if (!grinded && !produced && !issued && !wheatReceivedKg) return;

    addWheatLogEntry({
      date,
      wheatReceivedKg: Number(wheatReceivedKg) || undefined,
      wheatGrindedKg: grinded,
      attaProducedKg: produced,
      attaIssuedKg: issued,
    });
    setWheatReceivedKg("");
    setWheatGrindedKg("");
    setAttaProducedKg("");
    setAttaIssuedKg("");
  };

  return (
    <ClayCard accent="sky" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Mill Operations</h2>
        <p className="text-sm text-muted">
          Internal wheat intake &amp; grinding tracker — separate from the government subsidy
          program.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatFlowCard
          icon={<TruckIcon />}
          value={`${wheatStats.totalReceived.toLocaleString()} kg`}
          label="Total Wheat Received"
          accent="violet"
          subMetrics={[
            { icon: <GearIcon />, label: "Total Grinded", value: `${wheatStats.totalGrinded.toLocaleString()} kg` },
            { icon: <ScaleIcon />, label: "Stock / Balance", value: `${wheatStats.stockBalance.toLocaleString()} kg` },
          ]}
        />
        <StatFlowCard
          icon={<GridIcon />}
          value={`${attaStats.totalProduced.toLocaleString()} kg`}
          label="Atta Produced"
          accent="emerald"
          subMetrics={[
            { icon: <BoxIcon />, label: "Atta Issued", value: `${attaStats.totalIssued.toLocaleString()} kg` },
            { icon: <ScaleIcon />, label: "Stock / Balance", value: `${attaStats.stockBalance.toLocaleString()} kg` },
          ]}
        />
      </div>

      <StatFlowCard
        icon={<CalendarIcon />}
        value={`${today.wheatGrindedToday.toLocaleString()} kg`}
        label="Wheat Grinded"
        accent="sky"
        highlighted
        subMetrics={[
          { icon: <GridIcon />, label: "Atta Produced Today", value: `${today.attaProducedToday.toLocaleString()} kg` },
          { icon: <BoxIcon />, label: "Atta Issued Today", value: `${today.attaIssuedToday.toLocaleString()} kg` },
        ]}
      />

      <div className="pt-2 border-t border-muted/15 flex flex-col gap-3">
        <p className="text-sm font-medium text-muted">Log Today&apos;s Activity</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
          <ClayInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <ClayInput
            label="Wheat Received"
            type="number"
            suffix="kg"
            value={wheatReceivedKg}
            onChange={(e) => setWheatReceivedKg(e.target.value)}
          />
          <ClayInput
            label="Wheat Grinded"
            type="number"
            suffix="kg"
            value={wheatGrindedKg}
            onChange={(e) => setWheatGrindedKg(e.target.value)}
          />
          <ClayInput
            label="Atta Produced"
            type="number"
            suffix="kg"
            value={attaProducedKg}
            onChange={(e) => setAttaProducedKg(e.target.value)}
          />
          <ClayInput
            label="Atta Issued"
            type="number"
            suffix="kg"
            value={attaIssuedKg}
            onChange={(e) => setAttaIssuedKg(e.target.value)}
          />
        </div>
        <ClayButton type="button" variant="secondary" onClick={handleLog}>
          Log Entry
        </ClayButton>
      </div>
    </ClayCard>
  );
}
