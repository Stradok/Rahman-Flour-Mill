"use client";

import { useEffect, type ReactNode } from "react";

interface DetailModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
}

export function DetailModal({
  title,
  subtitle,
  onClose,
  children,
  maxWidthClassName = "max-w-3xl",
}: DetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
      onClick={onClose}
    >
      <div
        className={`clay-card rounded-[32px] p-6 w-full ${maxWidthClassName} max-h-[85vh] flex flex-col gap-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-black text-xl text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="clay-btn shrink-0 rounded-[14px] w-9 h-9 flex items-center justify-center text-muted font-heading font-extrabold hover:-translate-y-0.5 active:scale-90 transition-all"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
