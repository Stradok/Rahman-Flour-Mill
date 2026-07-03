import type { ElementType, ReactNode } from "react";

interface ClaySurfaceProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function ClaySurface({ as: Tag = "div", className = "", children }: ClaySurfaceProps) {
  return (
    <Tag className={`clay-surface rounded-[48px] sm:rounded-[60px] p-6 sm:p-10 ${className}`}>
      {children}
    </Tag>
  );
}
