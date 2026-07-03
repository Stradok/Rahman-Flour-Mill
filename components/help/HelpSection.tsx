import type { ReactNode } from "react";
import { ClayCard } from "@/components/clay/ClayCard";

type Accent = "violet" | "pink" | "sky" | "emerald" | "amber";

interface HelpItem {
  icon: string;
  title: string;
  body: string;
}

interface HelpSectionProps {
  eyebrow: string;
  title: string;
  accent: Accent;
  items: HelpItem[];
  footer?: ReactNode;
}

export function HelpSection({ eyebrow, title, accent, items, footer }: HelpSectionProps) {
  return (
    <ClayCard accent={accent} className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-heading font-extrabold uppercase tracking-wide text-muted">
          {eyebrow}
        </p>
        <h2 className="font-heading font-black text-xl text-ink">{title}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="text-2xl leading-none shrink-0">{item.icon}</div>
            <div>
              <p className="font-heading font-extrabold text-ink text-sm">{item.title}</p>
              <p className="text-sm text-muted">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {footer}
    </ClayCard>
  );
}
