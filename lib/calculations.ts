import type {
  CostOverheadEntry,
  OverheadCategory,
  ProductionEntry,
  Transaction,
  WheatGrindingLog,
} from "./types";
import { addDaysToDateOnly, todayDateOnly } from "./datetime";

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

// Accepts either a plain date ("YYYY-MM-DD") or a datetime-local string
// ("YYYY-MM-DDTHH:mm") — always compares by calendar date only.
export function isToday(dateStr: string): boolean {
  return dateStr.slice(0, 10) === todayDateOnly();
}

// Mill Operations figures are derived from the ledger/production/sales data, plus the
// manually-logged Daily Grinding entries (grinding is mill-wide, not tied to a brand).

export function totalWheatReceivedKg(entries: CostOverheadEntry[]): number {
  return entries.reduce((s, e) => s + (e.wheatVolumeKg ?? 0), 0);
}

export function totalAttaProducedKg(entries: ProductionEntry[]): number {
  return entries.reduce((s, e) => s + e.bags * e.weightKg, 0);
}

export function totalAttaIssuedKg(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => s + t.quantity * t.weightKg, 0);
}

export function totalWheatGrindedKg(entries: WheatGrindingLog[]): number {
  return entries.reduce((s, e) => s + e.wheatGrindedKg, 0);
}

export function todayWheatGrindedKg(entries: WheatGrindingLog[]): number {
  return entries
    .filter((e) => isToday(e.date.slice(0, 10)))
    .reduce((s, e) => s + e.wheatGrindedKg, 0);
}

export function wheatGrindedOnDate(entries: WheatGrindingLog[], selectedDate: string): number {
  return entries
    .filter((e) => e.date.slice(0, 10) === selectedDate)
    .reduce((s, e) => s + e.wheatGrindedKg, 0);
}

export function grindingEntriesToday(entries: WheatGrindingLog[]): WheatGrindingLog[] {
  return entries.filter((e) => isToday(e.date));
}

export function productionEntriesToday(entries: ProductionEntry[]): ProductionEntry[] {
  return entries.filter((e) => isToday(e.date));
}

export interface MillOperationsStatsSummary {
  wheatReceivedKg: number;
  wheatGrindedKg: number;
  wheatStockBalanceKg: number;
  attaProducedKg: number;
  attaIssuedKg: number;
  attaStockBalanceKg: number;
}

// asOfDate ("YYYY-MM-DD") caps every input to that calendar date or earlier, so the owner can
// see what the cumulative totals looked like on any given day — defaults to today.
export function cumulativeMillStats(
  costLedger: CostOverheadEntry[],
  productionLog: ProductionEntry[],
  transactions: Transaction[],
  grindingLog: WheatGrindingLog[],
  asOfDate: string = todayDateOnly()
): MillOperationsStatsSummary {
  const upToDate = (d: string) => d.slice(0, 10) <= asOfDate;
  const wheatReceivedKg = totalWheatReceivedKg(costLedger.filter((e) => upToDate(e.createdAt)));
  const attaProducedKg = totalAttaProducedKg(productionLog.filter((e) => upToDate(e.date)));
  const wheatGrindedKg = totalWheatGrindedKg(grindingLog.filter((e) => upToDate(e.date)));
  const attaIssuedKg = totalAttaIssuedKg(transactions.filter((t) => upToDate(t.createdAt)));
  return {
    wheatReceivedKg,
    wheatGrindedKg,
    wheatStockBalanceKg: Math.max(wheatReceivedKg - wheatGrindedKg, 0),
    attaProducedKg,
    attaIssuedKg,
    attaStockBalanceKg: Math.max(attaProducedKg - attaIssuedKg, 0),
  };
}

export function millStatsOnDate(
  costLedger: CostOverheadEntry[],
  productionLog: ProductionEntry[],
  transactions: Transaction[],
  grindingLog: WheatGrindingLog[],
  date: string
) {
  const onDate = (d: string) => d.slice(0, 10) === date;
  const dateCost = costLedger.filter((e) => onDate(e.createdAt));
  const dateProduction = productionLog.filter((e) => onDate(e.date));
  const dateTransactions = transactions.filter((t) => onDate(t.createdAt));

  return {
    wheatReceived: totalWheatReceivedKg(dateCost),
    wheatGrinded: wheatGrindedOnDate(grindingLog, date),
    attaProduced: totalAttaProducedKg(dateProduction),
    attaIssued: totalAttaIssuedKg(dateTransactions),
  };
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

// asOfDate ("YYYY-MM-DD"), when given, caps production/sales to that calendar date or
// earlier — omit it for the current, unfiltered totals.
export function stockByBrandSize(
  productionLog: ProductionEntry[],
  transactions: Transaction[],
  asOfDate?: string
): StockRow[] {
  const key = (brandId: string, sizeId: string) => `${brandId}:${sizeId}`;
  const upToDate = (d: string) => !asOfDate || d.slice(0, 10) <= asOfDate;
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
    if (!upToDate(entry.date)) continue;
    ensure(entry.brandId, entry.brandName, entry.packagingSizeId, entry.packagingLabel, entry.weightKg)
      .producedBags += entry.bags;
  }
  for (const t of transactions) {
    if (!upToDate(t.createdAt)) continue;
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

// --- Daily Stock: per-brand opening/closing stock movement for a chosen day ---

export interface DailyStockRow {
  brandId: string;
  brandName: string;
  packagingSizeId: string;
  packagingLabel: string;
  weightKg: number;
  openingStockBags: number;
  productionTodayBags: number;
  salesTodayBags: number;
  closingStockBags: number;
}

export function dailyStockByBrand(
  productionLog: ProductionEntry[],
  transactions: Transaction[],
  selectedDate: string // "YYYY-MM-DD"
): DailyStockRow[] {
  const key = (brandId: string, sizeId: string) => `${brandId}:${sizeId}`;
  const meta = new Map<
    string,
    { brandId: string; brandName: string; packagingSizeId: string; packagingLabel: string; weightKg: number }
  >();
  for (const p of productionLog) {
    meta.set(key(p.brandId, p.packagingSizeId), {
      brandId: p.brandId,
      brandName: p.brandName,
      packagingSizeId: p.packagingSizeId,
      packagingLabel: p.packagingLabel,
      weightKg: p.weightKg,
    });
  }
  for (const t of transactions) {
    const k = key(t.brandId, t.packagingSizeId);
    if (!meta.has(k)) {
      meta.set(k, {
        brandId: t.brandId,
        brandName: t.brandName,
        packagingSizeId: t.packagingSizeId,
        packagingLabel: t.packagingLabel,
        weightKg: t.weightKg,
      });
    }
  }

  return Array.from(meta.values())
    .map(({ brandId, brandName, packagingSizeId, packagingLabel, weightKg }) => {
      const priorProduction = productionLog
        .filter(
          (p) =>
            p.brandId === brandId &&
            p.packagingSizeId === packagingSizeId &&
            p.date.slice(0, 10) < selectedDate
        )
        .reduce((s, p) => s + p.bags, 0);
      const priorSales = transactions
        .filter(
          (t) =>
            t.brandId === brandId &&
            t.packagingSizeId === packagingSizeId &&
            t.createdAt.slice(0, 10) < selectedDate
        )
        .reduce((s, t) => s + t.quantity, 0);
      const openingStockBags = Math.max(priorProduction - priorSales, 0);

      const productionTodayBags = productionLog
        .filter(
          (p) =>
            p.brandId === brandId &&
            p.packagingSizeId === packagingSizeId &&
            p.date.slice(0, 10) === selectedDate
        )
        .reduce((s, p) => s + p.bags, 0);
      const salesTodayBags = transactions
        .filter(
          (t) =>
            t.brandId === brandId &&
            t.packagingSizeId === packagingSizeId &&
            t.createdAt.slice(0, 10) === selectedDate
        )
        .reduce((s, t) => s + t.quantity, 0);

      const closingStockBags = Math.max(
        openingStockBags + productionTodayBags - salesTodayBags,
        0
      );

      return {
        brandId,
        brandName,
        packagingSizeId,
        packagingLabel,
        weightKg,
        openingStockBags,
        productionTodayBags,
        salesTodayBags,
        closingStockBags,
      };
    })
    .sort((a, b) => a.brandName.localeCompare(b.brandName) || a.weightKg - b.weightKg);
}

// --- Sales search: how much a brand sold in a single day or a date range ---

export interface SalesSearchResult {
  bags: number;
  revenue: number;
  transactionCount: number;
}

export function salesForBrandInRange(
  transactions: Transaction[],
  brandId: string,
  fromDate: string, // "YYYY-MM-DD"
  toDate: string // "YYYY-MM-DD", inclusive
): SalesSearchResult {
  const matches = transactions.filter((t) => {
    if (t.brandId !== brandId) return false;
    const d = t.createdAt.slice(0, 10);
    return d >= fromDate && d <= toDate;
  });
  return {
    bags: matches.reduce((s, t) => s + t.quantity, 0),
    revenue: matches.reduce((s, t) => s + t.subtotal, 0),
    transactionCount: matches.length,
  };
}

// --- Sales performance: Daily / Weekly / Monthly / Yearly rollups ---

export function totalRevenue(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => s + t.subtotal, 0);
}

export interface SalesRollup {
  bags: number;
  revenue: number;
}

export interface DateRange {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD", inclusive
}

// Newest-first, for drill-down tables.
export function transactionsInDateRange(
  transactions: Transaction[],
  fromDate: string,
  toDate: string
): Transaction[] {
  return transactions
    .filter((t) => {
      const d = t.createdAt.slice(0, 10);
      return d >= fromDate && d <= toDate;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function salesInDateRange(
  transactions: Transaction[],
  fromDate: string,
  toDate: string
): SalesRollup {
  const matches = transactionsInDateRange(transactions, fromDate, toDate);
  return {
    bags: matches.reduce((s, t) => s + t.quantity, 0),
    revenue: matches.reduce((s, t) => s + t.subtotal, 0),
  };
}

export interface SalesPerformanceSummary {
  daily: SalesRollup;
  weekly: SalesRollup; // trailing 7 days, including today
  monthly: SalesRollup; // calendar month to date
  yearly: SalesRollup; // calendar year to date
}

export function salesPerformancePeriodRanges(): {
  daily: DateRange;
  weekly: DateRange;
  monthly: DateRange;
  yearly: DateRange;
} {
  const today = todayDateOnly();
  return {
    daily: { from: today, to: today },
    weekly: { from: addDaysToDateOnly(today, -6), to: today },
    monthly: { from: `${today.slice(0, 7)}-01`, to: today },
    yearly: { from: `${today.slice(0, 4)}-01-01`, to: today },
  };
}

export function salesPerformanceSummary(transactions: Transaction[]): SalesPerformanceSummary {
  const ranges = salesPerformancePeriodRanges();
  return {
    daily: salesInDateRange(transactions, ranges.daily.from, ranges.daily.to),
    weekly: salesInDateRange(transactions, ranges.weekly.from, ranges.weekly.to),
    monthly: salesInDateRange(transactions, ranges.monthly.from, ranges.monthly.to),
    yearly: salesInDateRange(transactions, ranges.yearly.from, ranges.yearly.to),
  };
}

// --- Financial health: all-time cost vs revenue vs profit ---

export interface FinancialHealthSummary {
  totalRawMaterialCost: number;
  totalOverheadCost: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
}

export function financialHealthSummary(
  costLedger: CostOverheadEntry[],
  transactions: Transaction[]
): FinancialHealthSummary {
  const rawMaterial = totalRawMaterialCost(costLedger);
  const overhead = totalOverheadCost(costLedger);
  const revenue = totalRevenue(transactions);
  return {
    totalRawMaterialCost: rawMaterial,
    totalOverheadCost: overhead,
    totalCost: rawMaterial + overhead,
    totalRevenue: revenue,
    netProfit: revenue - (rawMaterial + overhead),
  };
}

// --- Aggregate stock remaining across every brand/size ---

export function totalStockRemaining(
  productionLog: ProductionEntry[],
  transactions: Transaction[]
): { bags: number; kg: number } {
  const rows = stockByBrandSize(productionLog, transactions);
  return {
    bags: rows.reduce((s, r) => s + r.stockBags, 0),
    kg: rows.reduce((s, r) => s + r.stockKg, 0),
  };
}
