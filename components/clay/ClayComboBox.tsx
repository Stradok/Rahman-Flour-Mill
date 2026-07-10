"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface ClayComboBoxProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
}

export function ClayComboBox({
  id,
  label,
  placeholder = "Type to search...",
  value,
  onChange,
  options,
  disabled,
}: ClayComboBoxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const displayValue = isOpen ? query : (selectedOption?.label ?? "");

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        disabled={disabled}
        placeholder={selectedOption ? selectedOption.label : placeholder}
        value={displayValue}
        onFocus={() => {
          setIsOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
            setQuery("");
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="clay-pressed w-full rounded-[20px] bg-canvas px-4 py-3 text-ink font-body outline-none
          focus:shadow-[inset_12px_12px_22px_#d9d4e3,inset_-12px_-12px_22px_#ffffff]
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 clay-card rounded-[18px] p-2 max-h-64 overflow-y-auto flex flex-col gap-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted text-center py-3">No matches.</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setQuery("");
                  setIsOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-[12px] text-sm font-medium transition-colors
                  ${o.value === value ? "bg-violet/15 text-violet font-bold" : "hover:bg-canvas text-ink"}`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
