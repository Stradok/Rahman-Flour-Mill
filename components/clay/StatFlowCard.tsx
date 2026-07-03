import type { ReactNode } from "react";

type Accent = "violet" | "pink" | "sky" | "emerald" | "amber";

const ACCENT_TEXT: Record<Accent, string> = {
  violet: "text-violet",
  pink: "text-pink",
  sky: "text-sky",
  emerald: "text-emerald",
  amber: "text-amber",
};

interface SubMetric {
  icon: ReactNode;
  label: string;
  value: string;
}

interface StatFlowCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  accent?: Accent;
  subMetrics?: [SubMetric, SubMetric];
  highlighted?: boolean;
}

export function StatFlowCard({
  icon,
  value,
  label,
  accent = "emerald",
  subMetrics,
  highlighted = false,
}: StatFlowCardProps) {
  return (
    <div
      className={`clay-card rounded-[32px] p-6 flex flex-col items-center text-center gap-3
        ${highlighted ? "ring-2 ring-sky bg-sky/5" : ""}`}
    >
      <div className={`text-3xl ${ACCENT_TEXT[accent]}`}>{icon}</div>
      <div className={`font-heading font-black text-3xl ${ACCENT_TEXT[accent]}`}>{value}</div>
      <div className="text-sm font-medium text-ink">
        {label} {highlighted && <span className="underline decoration-sky">Today</span>}
      </div>

      {subMetrics && (
        <div className="w-full grid grid-cols-2 gap-4 pt-4 mt-1 border-t border-muted/15">
          {subMetrics.map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-lg text-muted">{m.icon}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted font-medium">
                {m.label}
              </div>
              <div className="font-heading font-extrabold text-ink">{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
