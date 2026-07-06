"use client";

import { useEffect } from "react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export function UndoToast({ message, onUndo, onDismiss, durationMs = 6000 }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="clay-btn bg-ink rounded-[20px] px-5 py-3.5 flex items-center justify-between gap-4">
        <span className="text-sm text-white font-medium truncate">{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="text-sky font-heading font-extrabold text-sm shrink-0 hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
