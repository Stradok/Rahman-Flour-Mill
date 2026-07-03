"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/sales", label: "Sales" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/help", label: "Help" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="w-full sticky top-0 z-10 bg-canvas/90 backdrop-blur px-3 py-3 sm:px-6 sm:py-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2.5 sm:flex-row sm:justify-between sm:gap-4">
        <div className="font-heading font-black text-base sm:text-xl text-ink text-center sm:text-left">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </div>
        <nav className="clay-pressed rounded-[18px] p-1 sm:p-1.5 flex gap-1 sm:gap-1.5 w-full sm:w-auto">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 sm:flex-none text-center px-2 py-2 sm:px-6 rounded-[14px] text-xs sm:text-sm font-heading font-extrabold transition-all
                  ${
                    active
                      ? "clay-btn bg-violet text-white"
                      : "text-muted hover:text-ink"
                  }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
