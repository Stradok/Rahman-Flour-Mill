"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ClayInput } from "@/components/clay/ClayInput";
import { ClaySelect } from "@/components/clay/ClaySelect";

interface EntryFiltersProps<T> {
  entries: T[];
  idPrefix: string;
  getSearchText: (entry: T) => string;
  getDate: (entry: T) => string;
  getEnteredBy: (entry: T) => string | undefined;
  searchPlaceholder?: string;
  children: (visible: T[]) => ReactNode;
}

export function EntryFilters<T>({
  entries,
  idPrefix,
  getSearchText,
  getDate,
  getEnteredBy,
  searchPlaceholder = "Search",
  children,
}: EntryFiltersProps<T>) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [enteredByFilter, setEnteredByFilter] = useState("");

  const enteredByOptions = useMemo(() => {
    const names = new Set<string>();
    for (const e of entries) {
      const n = getEnteredBy(e);
      if (n) names.add(n);
    }
    return [
      { value: "", label: "All" },
      ...Array.from(names)
        .sort()
        .map((n) => ({ value: n, label: n })),
    ];
  }, [entries, getEnteredBy]);

  const showEnteredByFilter = enteredByOptions.length > 1;
  const hasActiveFilter = search.trim() !== "" || dateFilter !== "" || enteredByFilter !== "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (dateFilter && getDate(e).slice(0, 10) !== dateFilter) return false;
      if (enteredByFilter && getEnteredBy(e) !== enteredByFilter) return false;
      if (q && !getSearchText(e).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, search, dateFilter, enteredByFilter, getDate, getEnteredBy, getSearchText]);

  const clearFilters = () => {
    setSearch("");
    setDateFilter("");
    setEnteredByFilter("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`grid grid-cols-1 gap-3 ${showEnteredByFilter ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        <ClayInput
          id={`${idPrefix}-search`}
          label="Search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ClayInput
          id={`${idPrefix}-date`}
          label="Date"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        {showEnteredByFilter && (
          <ClaySelect
            id={`${idPrefix}-entered-by`}
            label="Entered By"
            value={enteredByFilter}
            onChange={(e) => setEnteredByFilter(e.target.value)}
            options={enteredByOptions}
          />
        )}
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

      {children(filtered)}
    </div>
  );
}
