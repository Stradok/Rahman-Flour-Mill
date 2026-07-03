import type { Transaction } from "./types";

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateBillNumber(existing: Transaction[]): string {
  const next = existing.length + 1;
  const candidate = `BILL-${String(next).padStart(4, "0")}`;
  const taken = new Set(existing.map((t) => t.billNumber));
  if (!taken.has(candidate)) return candidate;
  let n = next;
  let bump = candidate;
  while (taken.has(bump)) {
    n += 1;
    bump = `BILL-${String(n).padStart(4, "0")}`;
  }
  return bump;
}
