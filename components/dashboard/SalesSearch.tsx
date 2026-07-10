"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayComboBox } from "@/components/clay/ClayComboBox";
import { ClayInput } from "@/components/clay/ClayInput";
import { salesForBrandInRange } from "@/lib/calculations";
import { todayDateOnly } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

type Mode = "single" | "range";

export function SalesSearch() {
  const { brands, transactions } = useAppStore();

  const [brandId, setBrandId] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [singleDate, setSingleDate] = useState(todayDateOnly);
  const [fromDate, setFromDate] = useState(todayDateOnly);
  const [toDate, setToDate] = useState(todayDateOnly);
  const [result, setResult] = useState<{
    brandName: string;
    label: string;
    bags: number;
    revenue: number;
    transactionCount: number;
  } | null>(null);

  const handleSearch = () => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;
    const from = mode === "single" ? singleDate : fromDate;
    const to = mode === "single" ? singleDate : toDate;
    const res = salesForBrandInRange(transactions, brandId, from, to);
    setResult({
      brandName: brand.name,
      label: mode === "single" ? singleDate : `${fromDate} to ${toDate}`,
      ...res,
    });
  };

  return (
    <ClayCard accent="emerald" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Sales Search</h2>
        <p className="text-sm text-muted">
          Check how much a brand sold on a specific date, or across a date range.
        </p>
      </div>

      <ClayComboBox
        id="sales-search-brand"
        label="Brand"
        placeholder="Type to search brands..."
        value={brandId}
        onChange={setBrandId}
        options={brands.map((b) => ({ value: b.id, label: b.name }))}
      />

      <div className="flex gap-2">
        {(["single", "range"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 px-4 py-2.5 rounded-[16px] font-heading font-extrabold text-sm transition-all
              ${m === mode ? "clay-btn bg-emerald text-white" : "clay-pressed text-muted"}`}
          >
            {m === "single" ? "Single Date" : "Date Range"}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <ClayInput
          id="sales-search-date"
          label="Date"
          type="date"
          value={singleDate}
          onChange={(e) => setSingleDate(e.target.value)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClayInput
            id="sales-search-from"
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <ClayInput
            id="sales-search-till"
            label="Till"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSearch}
        disabled={!brandId}
        className="clay-btn bg-emerald text-white font-heading font-extrabold rounded-[18px] px-6 py-3 self-end
          disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        Search
      </button>

      {result && (
        <div className="clay-pressed rounded-[18px] p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">
            {result.brandName} · {result.label}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted">Bags Sold</div>
              <div className="font-heading font-black text-xl text-ink">
                {result.bags.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Revenue</div>
              <div className="font-heading font-black text-xl text-emerald">
                Rs {result.revenue.toLocaleString()}
              </div>
            </div>
          </div>
          <span className="text-xs text-muted">
            {result.transactionCount} sale{result.transactionCount === 1 ? "" : "s"} matched
          </span>
        </div>
      )}
    </ClayCard>
  );
}
