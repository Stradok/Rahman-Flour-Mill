import type {
  CostOverheadEntry,
  OverheadCategory,
  Transaction,
  WheatInventoryLog,
} from "./types";

export function subtotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function creditAmountLeft(subtotalValue: number, amountPaid: number): number {
  return Math.max(subtotalValue - amountPaid, 0);
}

export function totalRawMaterialCost(entries: CostOverheadEntry[]): number {
  return entries.reduce((sum, e) => {
    if (e.wheatVolumeKg && e.wheatRatePerKg) {
      return sum + e.wheatVolumeKg * e.wheatRatePerKg;
    }
    return sum;
  }, 0);
}

export function totalOverheadCost(
  entries: CostOverheadEntry[],
  category?: OverheadCategory
): number {
  return entries.reduce((sum, e) => {
    if (!e.category) return sum;
    if (category && e.category !== category) return sum;
    return sum + e.amount;
  }, 0);
}

export function costPerBag(totalCost: number, totalBags: number): number {
  return totalBags > 0 ? totalCost / totalBags : 0;
}

export function profitPerBag(retailPricePerBag: number, costPerBagValue: number): number {
  return retailPricePerBag - costPerBagValue;
}

export type MarginHealth = "below" | "near" | "above";

export function marginHealth(profit: number, target: number): MarginHealth {
  if (profit >= target) return "above";
  if (profit >= target * 0.75) return "near";
  return "below";
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export function cumulativeWheatStats(logs: WheatInventoryLog[]) {
  const totalReceived = logs.reduce((s, l) => s + (l.wheatReceivedKg ?? 0), 0);
  const totalGrinded = logs.reduce((s, l) => s + l.wheatGrindedKg, 0);
  return {
    totalReceived,
    totalGrinded,
    stockBalance: Math.max(totalReceived - totalGrinded, 0),
  };
}

export function cumulativeAttaStats(logs: WheatInventoryLog[]) {
  const totalProduced = logs.reduce((s, l) => s + l.attaProducedKg, 0);
  const totalIssued = logs.reduce((s, l) => s + l.attaIssuedKg, 0);
  return {
    totalProduced,
    totalIssued,
    stockBalance: Math.max(totalProduced - totalIssued, 0),
  };
}

export function todayWheatAttaStats(logs: WheatInventoryLog[]) {
  const today = logs.filter((l) => isToday(l.date));
  return {
    wheatGrindedToday: today.reduce((s, l) => s + l.wheatGrindedKg, 0),
    attaProducedToday: today.reduce((s, l) => s + l.attaProducedKg, 0),
    attaIssuedToday: today.reduce((s, l) => s + l.attaIssuedKg, 0),
  };
}

export function totalBagsSold(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => s + t.quantity, 0);
}

export function totalRevenue(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => s + t.subtotal, 0);
}

export function cashOnHand(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => {
    if (t.paymentMode === "full") return s + t.subtotal;
    return s + (t.amountPaid ?? 0);
  }, 0);
}

export function runwayIndicator(cash: number, dailyOverheadBurn: number): number {
  if (dailyOverheadBurn <= 0) return Infinity;
  return cash / dailyOverheadBurn;
}
