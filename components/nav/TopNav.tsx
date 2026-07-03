"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/sales", label: "Sales" },
  { href: "/dashboard", label: "Dashboard" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="w-full sticky top-0 z-10 bg-canvas/90 backdrop-blur px-4 py-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="font-heading font-black text-lg sm:text-xl text-ink">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </div>
        <nav className="clay-pressed rounded-[20px] p-1.5 flex gap-1.5">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 sm:px-6 rounded-[14px] text-sm font-heading font-extrabold transition-all
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
