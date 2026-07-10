"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { formatDateTime } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

export function ProductChangeLog() {
  const { productChangeLog } = useAppStore();

  return (
    <ClayCard className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Change Log</h2>
        <p className="text-sm text-muted">
          A permanent record of every brand or packaging size added, edited, or removed — who did
          it and when. Once this becomes a cloud-based system, this will show a Google account
          stamp instead of a typed name.
        </p>
      </div>
      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
        {productChangeLog.map((entry) => (
          <div key={entry.id} className="clay-card rounded-[16px] px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-heading font-extrabold text-ink truncate">
                {entry.summary}
              </span>
              <span className="text-xs text-muted shrink-0">
                {formatDateTime(entry.changedAt)}
              </span>
            </div>
            <span className="text-xs text-muted">By {entry.changedBy}</span>
          </div>
        ))}
        {productChangeLog.length === 0 && (
          <p className="text-sm text-muted text-center py-4">No changes logged yet.</p>
        )}
      </div>
    </ClayCard>
  );
}
