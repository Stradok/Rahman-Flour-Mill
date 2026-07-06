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

export interface MillOperationsStatsSummary {
  wheatReceivedKg: number;
  wheatGrindedKg: number;
  wheatStockBalanceKg: number;
  attaProducedKg: number;
  attaIssuedKg: number;
  attaStockBalanceKg: number;
}

export function cumulativeMillStats(
  costLedger: CostOverheadEntry[],
  productionLog: ProductionEntry[],
  transactions: Transaction[],
  grindingLog: WheatGrindingLog[]
): MillOperationsStatsSummary {
  const wheatReceivedKg = totalWheatReceivedKg(costLedger);
  const attaProducedKg = totalAttaProducedKg(productionLog);
  const wheatGrindedKg = totalWheatGrindedKg(grindingLog);
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
  transactions: Transaction[],
  grindingLog: WheatGrindingLog[]
) {
  const todayCost = costLedger.filter((e) => isToday(e.createdAt.slice(0, 10)));
  const todayProduction = productionLog.filter((e) => isToday(e.date.slice(0, 10)));
  const todayTransactions = transactions.filter((t) => isToday(t.createdAt.slice(0, 10)));

  return {
    wheatReceivedToday: totalWheatReceivedKg(todayCost),
    wheatGrindedToday: todayWheatGrindedKg(grindingLog),
    attaProducedToday: totalAttaProducedKg(todayProduction),
    attaIssuedToday: totalAttaIssuedKg(todayTransactions),
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

function salesInDateRange(
  transactions: Transaction[],
  fromDate: string,
  toDate: string
): SalesRollup {
  const matches = transactions.filter((t) => {
    const d = t.createdAt.slice(0, 10);
    return d >= fromDate && d <= toDate;
  });
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

export function salesPerformanceSummary(transactions: Transaction[]): SalesPerformanceSummary {
  const today = todayDateOnly();
  const weekStart = addDaysToDateOnly(today, -6);
  const monthStart = `${today.slice(0, 7)}-01`;
  const yearStart = `${today.slice(0, 4)}-01-01`;

  return {
    daily: salesInDateRange(transactions, today, today),
    weekly: salesInDateRange(transactions, weekStart, today),
    monthly: salesInDateRange(transactions, monthStart, today),
    yearly: salesInDateRange(transactions, yearStart, today),
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
