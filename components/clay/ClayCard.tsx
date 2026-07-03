import type { ReactNode } from "react";

type Accent = "violet" | "pink" | "sky" | "emerald" | "amber";

const ACCENT_BORDER: Record<Accent, string> = {
  violet: "border-t-4 border-violet",
  pink: "border-t-4 border-pink",
  sky: "border-t-4 border-sky",
  emerald: "border-t-4 border-emerald",
  amber: "border-t-4 border-amber",
};

interface ClayCardProps {
  accent?: Accent;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}

export function ClayCard({ accent, padded = true, className = "", children }: ClayCardProps) {
  return (
    <div
      className={`clay-card rounded-[32px] ${padded ? "p-6" : ""} ${
        accent ? ACCENT_BORDER[accent] : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
