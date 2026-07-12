/**
 * Role-based access rules shared by the proxy (route protection) and the
 * sidebar (link visibility). Client-safe: no server imports allowed here.
 *
 * Staff must never see financials — costs, expenses, profit, or the audit
 * ledgers that contain them. API routes enforce the same rule server-side;
 * this list only controls navigation and page access.
 */
export const OWNER_ONLY_PAGES = [
  "/settings",
  "/dashboard/profit-projection",
  "/dashboard/cost-ledger",
  "/dashboard/entries",
  "/dashboard/mill-operations",
] as const;

export function isOwnerOnlyPage(pathname: string): boolean {
  return OWNER_ONLY_PAGES.some((prefix) => pathname.startsWith(prefix));
}
