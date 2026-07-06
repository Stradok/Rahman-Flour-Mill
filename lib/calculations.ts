import type { CostOverheadEntry, OverheadCategory, ProductionEntry, Transaction } from "./types";

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

// Mill Operations figures are fully derived from the ledger/production/sales data —
// no separate manual "wheat log" entry exists.

export function totalWheatReceivedKg(entries: CostOverheadEntry[]): number {
  return entries.reduce((s, e) => s + (e.wheatVolumeKg ?? 0), 0);
}

export function totalAttaProducedKg(entries: ProductionEntry[]): number {
  return entries.reduce((s, e) => s + e.bags * e.weightKg, 0);
}

export function totalAttaIssuedKg(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => s + t.quantity * t.weightKg, 0);
}

export interface MillOperationsStatsSummary {
  wheatReceivedKg: number;
  wheatGrindedKg: number;
  wheatStockBalanceKg: number;
  attaProducedKg: number;
  attaIssuedKg: number;
  attaStockBalanceKg: number;
}

// Wheat Grinded is assumed 1:1 with Atta Produced (no extraction-rate/wastage modeled yet).
export function cumulativeMillStats(
  costLedger: CostOverheadEntry[],
  productionLog: ProductionEntry[],
  transactions: Transaction[]
): MillOperationsStatsSummary {
  const wheatReceivedKg = totalWheatReceivedKg(costLedger);
  const attaProducedKg = totalAttaProducedKg(productionLog);
  const wheatGrindedKg = attaProducedKg;
  const attaIssuedKg = totalAttaIssuedKg(transactions);
  return {
    wheatReceivedKg,
    wheatGrindedKg,
    wheatStockBalanceKg: Math.max(wheatReceivedKg - wheatGrindedKg, 0),
    attaProducedKg,
    attaIssuedKg,
    attaStockBalanceKg: Math.max(attaProducedKg - attaIssuedKg, 0),
  };
}

export function todayMillStats(
  costLedger: CostOverheadEntry[],
  productionLog: ProductionEntry[],
  transactions: Transaction[]
) {
  const todayCost = costLedger.filter((e) => isToday(e.createdAt.slice(0, 10)));
  const todayProduction = productionLog.filter((e) => isToday(e.date));
  const todayTransactions = transactions.filter((t) => isToday(t.createdAt.slice(0, 10)));

  const wheatReceivedToday = totalWheatReceivedKg(todayCost);
  const attaProducedToday = totalAttaProducedKg(todayProduction);
  return {
    wheatReceivedToday,
    wheatGrindedToday: attaProducedToday,
    attaProducedToday,
    attaIssuedToday: totalAttaIssuedKg(todayTransactions),
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

export function totalBagsProduced(entries: ProductionEntry[]): number {
  return entries.reduce((s, e) => s + e.bags, 0);
}

export interface ProductionMixSizeRow {
  packagingSizeId: string;
  packagingLabel: string;
  weightKg: number;
  bags: number;
}

export interface ProductionMixRow {
  brandId: string;
  brandName: string;
  bags: number;
  percentage: number; // 0-100
  totalWeightKg: number;
  sizes: ProductionMixSizeRow[];
}

export function productionMixByBrand(entries: ProductionEntry[]): ProductionMixRow[] {
  const total = totalBagsProduced(entries);
  const byBrand = new Map<
    string,
    { brandName: string; bags: number; sizes: Map<string, ProductionMixSizeRow> }
  >();

  for (const entry of entries) {
    if (!byBrand.has(entry.brandId)) {
      byBrand.set(entry.brandId, { brandName: entry.brandName, bags: 0, sizes: new Map() });
    }
    const brandBucket = byBrand.get(entry.brandId)!;
    brandBucket.bags += entry.bags;

    const existingSize = brandBucket.sizes.get(entry.packagingSizeId);
    if (existingSize) {
      existingSize.bags += entry.bags;
    } else {
      brandBucket.sizes.set(entry.packagingSizeId, {
        packagingSizeId: entry.packagingSizeId,
        packagingLabel: entry.packagingLabel,
        weightKg: entry.weightKg,
        bags: entry.bags,
      });
    }
  }

  return Array.from(byBrand.entries())
    .map(([brandId, { brandName, bags, sizes }]) => {
      const sizeRows = Array.from(sizes.values()).sort((a, b) => b.bags - a.bags);
      return {
        brandId,
        brandName,
        bags,
        percentage: total > 0 ? (bags / total) * 100 : 0,
        totalWeightKg: sizeRows.reduce((s, r) => s + r.bags * r.weightKg, 0),
        sizes: sizeRows,
      };
    })
    .sort((a, b) => b.bags - a.bags);
}

export function totalProductionWeightKg(entries: ProductionEntry[]): number {
  return entries.reduce((s, e) => s + e.bags * e.weightKg, 0);
}

// --- Stock check: what's actually left of each brand/size, produced minus sold ---

export interface StockRow {
  brandId: string;
  brandName: string;
  packagingSizeId: string;
  packagingLabel: string;
  weightKg: number;
  producedBags: number;
  soldBags: number;
  stockBags: number;
  stockKg: number;
}

export function stockByBrandSize(
  productionLog: ProductionEntry[],
  transactions: Transaction[]
): StockRow[] {
  const key = (brandId: string, sizeId: string) => `${brandId}:${sizeId}`;
  const rows = new Map<string, StockRow>();

  const ensure = (
    brandId: string,
    brandName: string,
    packagingSizeId: string,
    packagingLabel: string,
    weightKg: number
  ) => {
    const k = key(brandId, packagingSizeId);
    if (!rows.has(k)) {
      rows.set(k, {
        brandId,
        brandName,
        packagingSizeId,
        packagingLabel,
        weightKg,
        producedBags: 0,
        soldBags: 0,
        stockBags: 0,
        stockKg: 0,
      });
    }
    return rows.get(k)!;
  };

  for (const entry of productionLog) {
    ensure(entry.brandId, entry.brandName, entry.packagingSizeId, entry.packagingLabel, entry.weightKg)
      .producedBags += entry.bags;
  }
  for (const t of transactions) {
    ensure(t.brandId, t.brandName, t.packagingSizeId, t.packagingLabel, t.weightKg).soldBags +=
      t.quantity;
  }

  return Array.from(rows.values())
    .map((row) => {
      const stockBags = Math.max(row.producedBags - row.soldBags, 0);
      return { ...row, stockBags, stockKg: stockBags * row.weightKg };
    })
    .sort((a, b) => a.brandName.localeCompare(b.brandName) || a.weightKg - b.weightKg);
}

// --- Monthly business summary (for trend charts & month-over-month comparison) ---

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export interface MonthlySummary {
  monthKey: string;
  label: string;
  totalCost: number;
  totalRevenue: number;
  bagsSold: number;
  avgRatePerBag: number;
  profit: number;
}

export function monthlyBusinessSummary(
  transactions: Transaction[],
  costLedger: CostOverheadEntry[]
): MonthlySummary[] {
  const months = new Map<string, { revenue: number; bagsSold: number; cost: number }>();

  const ensure = (key: string) => {
    if (!months.has(key)) months.set(key, { revenue: 0, bagsSold: 0, cost: 0 });
    return months.get(key)!;
  };

  for (const t of transactions) {
    ensure(monthKey(t.createdAt)).revenue += t.subtotal;
    ensure(monthKey(t.createdAt)).bagsSold += t.quantity;
  }
  for (const e of costLedger) {
    const bucket = ensure(monthKey(e.createdAt));
    if (e.wheatVolumeKg && e.wheatRatePerKg) {
      bucket.cost += e.wheatVolumeKg * e.wheatRatePerKg;
    } else if (e.category) {
      bucket.cost += e.amount;
    }
  }

  return Array.from(months.entries())
    .map(([key, v]) => ({
      monthKey: key,
      label: monthLabel(key),
      totalCost: v.cost,
      totalRevenue: v.revenue,
      bagsSold: v.bagsSold,
      avgRatePerBag: v.bagsSold > 0 ? v.revenue / v.bagsSold : 0,
      profit: v.revenue - v.cost,
    }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // null = no meaningful % (nothing to compare against)
  return ((current - previous) / previous) * 100;
}
