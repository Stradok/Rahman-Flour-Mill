"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Sales",
    items: [{ href: "/sales/quick-bill", label: "Quick Bill & Ledger", icon: "🧾" }],
  },
  {
    title: "Dashboard",
    items: [
      { href: "/dashboard/profit-projection", label: "Profit Projection", icon: "📊" },
      { href: "/dashboard/mill-operations", label: "Mill Operations", icon: "🚚" },
      { href: "/dashboard/product-packaging", label: "Product & Packaging", icon: "🏷️" },
      { href: "/dashboard/cost-ledger", label: "Cost & Overhead Ledger", icon: "📋" },
      { href: "/dashboard/entries", label: "Entries", icon: "📜" },
    ],
  },
];

const HELP_ITEM: NavItem = { href: "/help", label: "Help", icon: "📖" };
const SETTINGS_ITEM: NavItem = { href: "/settings", label: "Settings", icon: "⚙️" };

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-[16px] text-sm font-heading font-extrabold transition-all leading-tight
        ${active ? "clay-btn bg-violet text-white" : "text-muted hover:text-ink hover:-translate-y-0.5"}`}
    >
      <span className="text-lg shrink-0">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="font-heading font-black text-lg text-ink px-1">
        Al Rehman <span className="text-violet">Flour Mills</span>
      </div>

      <nav className="flex flex-col gap-5 flex-1 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <p className="text-xs font-heading font-extrabold uppercase tracking-wide text-muted px-4">
              {group.title}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname?.startsWith(item.href)}
                onClick={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t border-muted/15 space-y-2">
        <NavLink item={HELP_ITEM} active={pathname?.startsWith(HELP_ITEM.href)} onClick={onNavigate} />
        {session?.user && (session.user as any).role === "owner" && (
          <NavLink item={SETTINGS_ITEM} active={pathname?.startsWith(SETTINGS_ITEM.href)} onClick={onNavigate} />
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-[16px] text-sm font-heading font-extrabold transition-all leading-tight w-full text-left text-muted hover:text-ink hover:-translate-y-0.5"
        >
          <span className="text-lg shrink-0">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-canvas/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="clay-btn rounded-[14px] w-11 h-11 flex items-center justify-center text-xl"
        >
          ☰
        </button>
        <div className="font-heading font-black text-base text-ink">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </div>
        <div className="w-11" />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex bg-ink/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="clay-surface rounded-r-[32px] w-72 max-w-[80vw] h-full p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-extrabold text-muted uppercase tracking-wide">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="clay-btn rounded-[12px] w-9 h-9 flex items-center justify-center font-heading font-black"
              >
                ×
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-80 shrink-0 h-screen sticky top-0 p-5">
        <div className="clay-surface rounded-[32px] p-5 h-full">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>
    </>
  );
}
