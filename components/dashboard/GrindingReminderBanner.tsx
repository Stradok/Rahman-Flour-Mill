"use client";

import Link from "next/link";
import { isToday } from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

export function GrindingReminderBanner() {
  const { grindingLog } = useAppStore();
  const loggedToday = grindingLog.some((e) => isToday(e.date.slice(0, 10)));

  if (loggedToday) return null;

  return (
    <div className="clay-card rounded-[24px] border-t-4 border-amber p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0">⚠️</span>
        <div>
          <p className="font-heading font-extrabold text-ink">
            Today&apos;s grinding hasn&apos;t been logged yet
          </p>
          <p className="text-sm text-muted">Log it before you leave for the day.</p>
        </div>
      </div>
      <Link
        href="/dashboard/cost-ledger"
        className="clay-btn bg-amber text-white font-heading font-extrabold rounded-[16px] px-5 py-2.5 shrink-0
          hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        Log Grinding
      </Link>
    </div>
  );
}
