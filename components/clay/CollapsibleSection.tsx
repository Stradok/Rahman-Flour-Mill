"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  icon: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  icon,
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="clay-card rounded-[20px] p-4 flex items-center justify-between gap-3 w-full text-left
          transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-heading font-extrabold text-ink leading-tight">{title}</h3>
            {description && (
              <p className="text-xs text-muted truncate hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {badge}
          <span
            className={`text-muted text-lg transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            ⌄
          </span>
        </div>
      </button>

      {open && <div className="flex flex-col gap-4 px-1">{children}</div>}
    </div>
  );
}
