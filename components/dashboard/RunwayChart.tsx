export function RunwayChart({ days }: { days: number }) {
  const capped = Number.isFinite(days) ? Math.min(days, 60) : 60;
  const pct = Math.max(Math.min((capped / 60) * 100, 100), 2);
  const color = days >= 30 ? "bg-emerald" : days >= 10 ? "bg-amber" : "bg-pink";

  return (
    <div className="flex flex-col gap-2">
      <div className="clay-pressed rounded-full h-6 w-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted">
        {Number.isFinite(days) ? `${Math.round(days)} days of operational runway` : "No overhead burn recorded"}
      </span>
    </div>
  );
}
