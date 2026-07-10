"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import useSWR from "swr";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { STORAGE_KEYS } from "@/lib/constants";
import type {
  Brand,
  CostOverheadEntry,
  DeletionLogEntry,
  PackagingSize,
  ProductChangeLogEntry,
  ProductionEntry,
  ReturnLogEntry,
  Transaction,
  WheatGrindingLog,
} from "@/lib/types";

const jsonFetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Request to ${url} failed with ${res.status}`);
    return res.json();
  });

const jsonRequest = (url: string, method: string, body?: unknown) =>
  fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => {
    if (!res.ok) throw new Error(`Request to ${url} failed with ${res.status}`);
    return res.json();
  });

interface AppStoreValue {
  lastEnteredBy: string;
  setLastEnteredBy: React.Dispatch<React.SetStateAction<string>>;

  brands: Brand[];
  addBrand: (name: string) => void;
  addPackagingSize: (brandId: string, size: Omit<PackagingSize, "id">) => void;
  updatePackagingSize: (
    brandId: string,
    sizeId: string,
    updates: Partial<Omit<PackagingSize, "id">>
  ) => void;
  removeBrand: (brandId: string) => void;
  removePackagingSize: (brandId: string, sizeId: string) => void;

  transactions: Transaction[];
  addTransactionBatch: (items: Omit<Transaction, "id" | "billNumber">[]) => Promise<Transaction[]>;
  removeTransaction: (id: string) => void;
  restoreTransaction: (tx: Transaction) => void;
  recordCreditPayment: (billNumber: string, amountReceived: number) => void;
  returnTransaction: (id: string, returnedBy: string, reason: string) => void;

  costLedger: CostOverheadEntry[];
  addCostEntry: (entry: Omit<CostOverheadEntry, "id">) => void;
  removeCostEntry: (id: string) => void;
  restoreCostEntry: (entry: CostOverheadEntry) => void;

  productionLog: ProductionEntry[];
  addProductionEntry: (entry: Omit<ProductionEntry, "id">) => void;
  removeProductionEntry: (id: string) => void;
  restoreProductionEntry: (entry: ProductionEntry) => void;

  grindingLog: WheatGrindingLog[];
  addGrindingEntry: (entry: Omit<WheatGrindingLog, "id">) => void;
  removeGrindingEntry: (id: string) => void;
  restoreGrindingEntry: (entry: WheatGrindingLog) => void;

  deletionLog: DeletionLogEntry[];
  logDeletion: (entry: Omit<DeletionLogEntry, "id">) => void;

  productChangeLog: ProductChangeLogEntry[];
  logProductChange: (entry: Omit<ProductChangeLogEntry, "id">) => void;

  returnLog: ReturnLogEntry[];
  logReturn: (entry: Omit<ReturnLogEntry, "id">) => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lastEnteredBy, setLastEnteredBy] = useLocalStorageState<string>(
    STORAGE_KEYS.lastEnteredBy,
    ""
  );
  // Brands & Packaging Sizes are backed by Postgres (via /api/brands), not localStorage —
  // the first data slice migrated off the browser as part of the backend rollout.
  const { data: brands = [], mutate: mutateBrands } = useSWR<Brand[]>("/api/brands", jsonFetcher);

  // Transactions are backed by Postgres too (via /api/transactions) — the second
  // data slice migrated off the browser.
  const { data: transactions = [], mutate: mutateTransactions } = useSWR<Transaction[]>(
    "/api/transactions",
    jsonFetcher
  );

  const { data: costLedger = [], mutate: mutateCostLedger } = useSWR<CostOverheadEntry[]>(
    "/api/cost-ledger",
    jsonFetcher
  );
  const { data: productionLog = [], mutate: mutateProductionLog } = useSWR<ProductionEntry[]>(
    "/api/production",
    jsonFetcher
  );
  const { data: grindingLog = [], mutate: mutateGrindingLog } = useSWR<WheatGrindingLog[]>(
    "/api/grinding",
    jsonFetcher
  );
  const { data: deletionLog = [], mutate: mutateDeletionLog } = useSWR<DeletionLogEntry[]>(
    "/api/deletion-log",
    jsonFetcher
  );
  const { data: productChangeLog = [], mutate: mutateProductChangeLog } = useSWR<
    ProductChangeLogEntry[]
  >("/api/product-change-log", jsonFetcher);
  const { data: returnLog = [], mutate: mutateReturnLog } = useSWR<ReturnLogEntry[]>(
    "/api/return-log",
    jsonFetcher
  );

  const addBrand = useCallback(
    async (name: string) => {
      const created: Brand = await jsonRequest("/api/brands", "POST", { name });
      mutateBrands((prev = []) => [...prev, created], { revalidate: false });
    },
    [mutateBrands]
  );

  const addPackagingSize = useCallback(
    async (brandId: string, size: Omit<PackagingSize, "id">) => {
      const created: PackagingSize = await jsonRequest(
        `/api/brands/${brandId}/sizes`,
        "POST",
        size
      );
      mutateBrands(
        (prev = []) =>
          prev.map((b) =>
            b.id === brandId ? { ...b, packagingSizes: [...b.packagingSizes, created] } : b
          ),
        { revalidate: false }
      );
    },
    [mutateBrands]
  );

  const updatePackagingSize = useCallback(
    async (brandId: string, sizeId: string, updates: Partial<Omit<PackagingSize, "id">>) => {
      await jsonRequest(`/api/brands/${brandId}/sizes/${sizeId}`, "PATCH", updates);
      mutateBrands(
        (prev = []) =>
          prev.map((b) =>
            b.id === brandId
              ? {
                  ...b,
                  packagingSizes: b.packagingSizes.map((s) =>
                    s.id === sizeId ? { ...s, ...updates } : s
                  ),
                }
              : b
          ),
        { revalidate: false }
      );
    },
    [mutateBrands]
  );

  const removeBrand = useCallback(
    async (brandId: string) => {
      await jsonRequest(`/api/brands/${brandId}`, "DELETE");
      mutateBrands((prev = []) => prev.filter((b) => b.id !== brandId), { revalidate: false });
    },
    [mutateBrands]
  );

  const removePackagingSize = useCallback(
    async (brandId: string, sizeId: string) => {
      await jsonRequest(`/api/brands/${brandId}/sizes/${sizeId}`, "DELETE");
      mutateBrands(
        (prev = []) =>
          prev.map((b) =>
            b.id === brandId
              ? { ...b, packagingSizes: b.packagingSizes.filter((s) => s.id !== sizeId) }
              : b
          ),
        { revalidate: false }
      );
    },
    [mutateBrands]
  );

  // All items share ONE bill number — used for multi-brand carts, where the
  // whole bill is one shared payment/credit balance rather than N separate ones.
  // The bill number is generated server-side, so callers must await the result.
  const addTransactionBatch = useCallback(
    async (items: Omit<Transaction, "id" | "billNumber">[]) => {
      const created: Transaction[] = await jsonRequest("/api/transactions/batch", "POST", {
        items,
      });
      mutateTransactions((prev = []) => [...created, ...prev], { revalidate: false });
      return created;
    },
    [mutateTransactions]
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      await jsonRequest(`/api/transactions/${id}`, "DELETE");
      mutateTransactions((prev = []) => prev.filter((t) => t.id !== id), { revalidate: false });
    },
    [mutateTransactions]
  );

  const restoreTransaction = useCallback(
    async (tx: Transaction) => {
      const restored: Transaction = await jsonRequest("/api/transactions/restore", "POST", tx);
      mutateTransactions(
        (prev = []) => (prev.some((t) => t.id === restored.id) ? prev : [restored, ...prev]),
        { revalidate: false }
      );
    },
    [mutateTransactions]
  );

  // Applies to every line item sharing this bill number, since a multi-item bill
  // has one shared balance rather than a separate one per brand/size.
  const recordCreditPayment = useCallback(
    async (billNumber: string, amountReceived: number) => {
      const updated: Transaction[] = await jsonRequest(
        `/api/transactions/by-bill/${billNumber}/payment`,
        "POST",
        { amountReceived }
      );
      mutateTransactions(
        (prev = []) => {
          const updatedIds = new Set(updated.map((t) => t.id));
          return [...updated, ...prev.filter((t) => !updatedIds.has(t.id))];
        },
        { revalidate: false }
      );
    },
    [mutateTransactions]
  );

  // Whole-line-item returns only. If the bill is still credit-pending, the
  // returned line's value comes straight off what's still owed on the bill.
  const returnTransaction = useCallback(
    async (id: string, returnedBy: string, reason: string) => {
      const updated: Transaction[] = await jsonRequest(`/api/transactions/${id}/return`, "POST", {
        returnedBy,
        reason,
      });
      mutateTransactions(
        (prev = []) => {
          const updatedIds = new Set(updated.map((t) => t.id));
          return [...updated, ...prev.filter((t) => !updatedIds.has(t.id))];
        },
        { revalidate: false }
      );
    },
    [mutateTransactions]
  );

  const addCostEntry = useCallback(
    async (entry: Omit<CostOverheadEntry, "id">) => {
      const created: CostOverheadEntry = await jsonRequest("/api/cost-ledger", "POST", entry);
      mutateCostLedger((prev = []) => [created, ...prev], { revalidate: false });
    },
    [mutateCostLedger]
  );

  const removeCostEntry = useCallback(
    async (id: string) => {
      await jsonRequest(`/api/cost-ledger/${id}`, "DELETE");
      mutateCostLedger((prev = []) => prev.filter((e) => e.id !== id), { revalidate: false });
    },
    [mutateCostLedger]
  );

  const restoreCostEntry = useCallback(
    async (entry: CostOverheadEntry) => {
      const restored: CostOverheadEntry = await jsonRequest(
        "/api/cost-ledger/restore",
        "POST",
        entry
      );
      mutateCostLedger(
        (prev = []) => (prev.some((e) => e.id === restored.id) ? prev : [restored, ...prev]),
        { revalidate: false }
      );
    },
    [mutateCostLedger]
  );

  const addProductionEntry = useCallback(
    async (entry: Omit<ProductionEntry, "id">) => {
      const created: ProductionEntry = await jsonRequest("/api/production", "POST", entry);
      mutateProductionLog((prev = []) => [created, ...prev], { revalidate: false });
    },
    [mutateProductionLog]
  );

  const removeProductionEntry = useCallback(
    async (id: string) => {
      await jsonRequest(`/api/production/${id}`, "DELETE");
      mutateProductionLog((prev = []) => prev.filter((e) => e.id !== id), { revalidate: false });
    },
    [mutateProductionLog]
  );

  const restoreProductionEntry = useCallback(
    async (entry: ProductionEntry) => {
      const restored: ProductionEntry = await jsonRequest(
        "/api/production/restore",
        "POST",
        entry
      );
      mutateProductionLog(
        (prev = []) => (prev.some((e) => e.id === restored.id) ? prev : [restored, ...prev]),
        { revalidate: false }
      );
    },
    [mutateProductionLog]
  );

  const addGrindingEntry = useCallback(
    async (entry: Omit<WheatGrindingLog, "id">) => {
      const created: WheatGrindingLog = await jsonRequest("/api/grinding", "POST", entry);
      mutateGrindingLog((prev = []) => [created, ...prev], { revalidate: false });
    },
    [mutateGrindingLog]
  );

  const removeGrindingEntry = useCallback(
    async (id: string) => {
      await jsonRequest(`/api/grinding/${id}`, "DELETE");
      mutateGrindingLog((prev = []) => prev.filter((e) => e.id !== id), { revalidate: false });
    },
    [mutateGrindingLog]
  );

  const restoreGrindingEntry = useCallback(
    async (entry: WheatGrindingLog) => {
      const restored: WheatGrindingLog = await jsonRequest("/api/grinding/restore", "POST", entry);
      mutateGrindingLog(
        (prev = []) => (prev.some((e) => e.id === restored.id) ? prev : [restored, ...prev]),
        { revalidate: false }
      );
    },
    [mutateGrindingLog]
  );

  const logDeletion = useCallback(
    async (entry: Omit<DeletionLogEntry, "id">) => {
      const created: DeletionLogEntry = await jsonRequest("/api/deletion-log", "POST", entry);
      mutateDeletionLog((prev = []) => [created, ...prev], { revalidate: false });
    },
    [mutateDeletionLog]
  );

  const logProductChange = useCallback(
    async (entry: Omit<ProductChangeLogEntry, "id">) => {
      const created: ProductChangeLogEntry = await jsonRequest(
        "/api/product-change-log",
        "POST",
        entry
      );
      mutateProductChangeLog((prev = []) => [created, ...prev], { revalidate: false });
    },
    [mutateProductChangeLog]
  );

  const logReturn = useCallback(
    async (entry: Omit<ReturnLogEntry, "id">) => {
      const created: ReturnLogEntry = await jsonRequest("/api/return-log", "POST", entry);
      mutateReturnLog((prev = []) => [created, ...prev], { revalidate: false });
    },
    [mutateReturnLog]
  );

  const value = useMemo<AppStoreValue>(
    () => ({
      lastEnteredBy,
      setLastEnteredBy,
      brands,
      addBrand,
      addPackagingSize,
      updatePackagingSize,
      removeBrand,
      removePackagingSize,
      transactions,
      addTransactionBatch,
      removeTransaction,
      restoreTransaction,
      recordCreditPayment,
      returnTransaction,
      costLedger,
      addCostEntry,
      removeCostEntry,
      restoreCostEntry,
      productionLog,
      addProductionEntry,
      removeProductionEntry,
      restoreProductionEntry,
      grindingLog,
      addGrindingEntry,
      removeGrindingEntry,
      restoreGrindingEntry,
      deletionLog,
      logDeletion,
      productChangeLog,
      logProductChange,
      returnLog,
      logReturn,
    }),
    [
      lastEnteredBy,
      setLastEnteredBy,
      brands,
      addBrand,
      addPackagingSize,
      updatePackagingSize,
      removeBrand,
      removePackagingSize,
      transactions,
      addTransactionBatch,
      removeTransaction,
      restoreTransaction,
      recordCreditPayment,
      returnTransaction,
      costLedger,
      addCostEntry,
      removeCostEntry,
      restoreCostEntry,
      productionLog,
      addProductionEntry,
      removeProductionEntry,
      restoreProductionEntry,
      grindingLog,
      addGrindingEntry,
      removeGrindingEntry,
      restoreGrindingEntry,
      deletionLog,
      logDeletion,
      productChangeLog,
      logProductChange,
      returnLog,
      logReturn,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
