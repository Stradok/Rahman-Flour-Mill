"use client";

import type { MonthlySummary } from "@/lib/calculations";

const WIDTH = 300;
const HEIGHT = 120;
const PADDING = 16;

export function SellingRateTrendChart({ months }: { months: MonthlySummary[] }) {
  const recent = months.slice(-6).filter((m) => m.bagsSold > 0);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-8">
        No sales logged yet — the average selling rate per bag will appear here once you
        have sales.
      </p>
    );
  }

  const values = recent.map((m) => m.avgRatePerBag);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const points = recent.map((m, i) => {
    const x =
      recent.length === 1
        ? WIDTH / 2
        : PADDING + (i / (recent.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((m.avgRatePerBag - minValue) / range) * (HEIGHT - PADDING * 2);
    return { x, y, m };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="clay-pressed rounded-[18px] px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">Latest — {last.m.label}</span>
        <span className="text-sm font-heading font-extrabold text-ink">
          Rs {Math.round(last.m.avgRatePerBag).toLocaleString()} / bag
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Average selling rate per bag trend"
      >
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="var(--color-muted)"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-violet)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={p.m.monthKey}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 5 : 4}
            fill="var(--color-violet)"
            stroke="var(--color-canvas)"
            strokeWidth={2}
          />
        ))}
      </svg>

      <div className={`flex px-1 ${points.length === 1 ? "justify-center" : "justify-between"}`}>
        {points.map((p) => (
          <span key={p.m.monthKey} className="text-[10px] text-muted font-medium">
            {p.m.label}
          </span>
        ))}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted font-medium select-none">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-3 font-medium">Month</th>
                <th className="py-1 font-medium">Avg Rate / Bag</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.monthKey} className="text-ink">
                  <td className="py-1 pr-3">{m.label}</td>
                  <td className="py-1">Rs {m.avgRatePerBag.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
