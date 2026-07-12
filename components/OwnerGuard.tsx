"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side backstop for owner-only pages. The proxy already redirects
 * staff at the routing layer and the APIs refuse them data — this guard
 * covers the remaining gap (stale client bundles, prefetched pages) so a
 * staff session never sees even the empty shell of a financial page.
 */
export function OwnerGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const blocked = status !== "loading" && role !== "owner";

  useEffect(() => {
    if (blocked) router.replace("/sales/quick-bill");
  }, [blocked, router]);

  if (status === "loading" || blocked) return null;
  return <>{children}</>;
}
