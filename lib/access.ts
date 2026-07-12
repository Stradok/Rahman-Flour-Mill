/**
 * Role-based access rules shared by the proxy (route protection) and the
 * sidebar (link visibility). Client-safe: no server imports allowed here.
 *
 * Staff work the till and log operations: Sales, Mill Operations, Product &
 * Packaging, and the Cost & Overhead Ledger (data entry). Owner-only areas
 * are the analytical/administrative ones: profit figures, the Entries audit
 * page, and Settings. API routes enforce the same split server-side.
 */
export const OWNER_ONLY_PAGES = [
  "/settings",
  "/dashboard/profit-projection",
  "/dashboard/entries",
] as const;

export function isOwnerOnlyPage(pathname: string): boolean {
  return OWNER_ONLY_PAGES.some((prefix) => pathname.startsWith(prefix));
}
