"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { STORAGE_KEYS } from "@/lib/constants";
import { generateBillNumber, generateId } from "@/lib/id";
import type {
  Brand,
  CostOverheadEntry,
  DeletionLogEntry,
  PackagingSize,
  ProductionEntry,
  Transaction,
  WheatGrindingLog,
} from "@/lib/types";

const DEFAULT_BRANDS: Brand[] = [
  {
    id: "brand-default-1",
    name: "Premium Atta",
    createdAt: new Date().toISOString(),
    packagingSizes: [
      { id: "size-default-1", label: "20kg", weightKg: 20, basePrice: 3200 },
      { id: "size-default-2", label: "40kg", weightKg: 40, basePrice: 6300 },
    ],
  },
];

interface AppStoreValue {
  lastEnteredBy: string;
  setLastEnteredBy: React.Dispatch<React.SetStateAction<string>>;

  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
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
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (tx: Omit<Transaction, "id" | "billNumber">) => Transaction;
  removeTransaction: (id: string) => void;
  restoreTransaction: (tx: Transaction) => void;

  costLedger: CostOverheadEntry[];
  setCostLedger: React.Dispatch<React.SetStateAction<CostOverheadEntry[]>>;
  addCostEntry: (entry: Omit<CostOverheadEntry, "id">) => void;
  removeCostEntry: (id: string) => void;
  restoreCostEntry: (entry: CostOverheadEntry) => void;

  productionLog: ProductionEntry[];
  setProductionLog: React.Dispatch<React.SetStateAction<ProductionEntry[]>>;
  addProductionEntry: (entry: Omit<ProductionEntry, "id">) => void;
  removeProductionEntry: (id: string) => void;
  restoreProductionEntry: (entry: ProductionEntry) => void;

  grindingLog: WheatGrindingLog[];
  setGrindingLog: React.Dispatch<React.SetStateAction<WheatGrindingLog[]>>;
  addGrindingEntry: (entry: Omit<WheatGrindingLog, "id">) => void;
  removeGrindingEntry: (id: string) => void;
  restoreGrindingEntry: (entry: WheatGrindingLog) => void;

  deletionLog: DeletionLogEntry[];
  logDeletion: (entry: Omit<DeletionLogEntry, "id">) => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lastEnteredBy, setLastEnteredBy] = useLocalStorageState<string>(
    STORAGE_KEYS.lastEnteredBy,
    ""
  );
  const [brands, setBrands] = useLocalStorageState<Brand[]>(
    STORAGE_KEYS.brands,
    DEFAULT_BRANDS
  );
  const [transactions, setTransactions] = useLocalStorageState<Transaction[]>(
    STORAGE_KEYS.transactions,
    []
  );
  const [costLedger, setCostLedger] = useLocalStorageState<CostOverheadEntry[]>(
    STORAGE_KEYS.costLedger,
    []
  );
  const [productionLog, setProductionLog] = useLocalStorageState<ProductionEntry[]>(
    STORAGE_KEYS.productionLog,
    []
  );
  const [grindingLog, setGrindingLog] = useLocalStorageState<WheatGrindingLog[]>(
    STORAGE_KEYS.grindingLog,
    []
  );
  const [deletionLog, setDeletionLog] = useLocalStorageState<DeletionLogEntry[]>(
    STORAGE_KEYS.deletionLog,
    []
  );

  const addBrand = useCallback(
    (name: string) => {
      setBrands((prev) => [
        ...prev,
        { id: generateId(), name, packagingSizes: [], createdAt: new Date().toISOString() },
      ]);
    },
    [setBrands]
  );

  const addPackagingSize = useCallback(
    (brandId: string, size: Omit<PackagingSize, "id">) => {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brandId
            ? { ...b, packagingSizes: [...b.packagingSizes, { ...size, id: generateId() }] }
            : b
        )
      );
    },
    [setBrands]
  );

  const updatePackagingSize = useCallback(
    (brandId: string, sizeId: string, updates: Partial<Omit<PackagingSize, "id">>) => {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brandId
            ? {
                ...b,
                packagingSizes: b.packagingSizes.map((s) =>
                  s.id === sizeId ? { ...s, ...updates } : s
                ),
              }
            : b
        )
      );
    },
    [setBrands]
  );

  const removeBrand = useCallback(
    (brandId: string) => {
      setBrands((prev) => prev.filter((b) => b.id !== brandId));
    },
    [setBrands]
  );

  const removePackagingSize = useCallback(
    (brandId: string, sizeId: string) => {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brandId
            ? { ...b, packagingSizes: b.packagingSizes.filter((s) => s.id !== sizeId) }
            : b
        )
      );
    },
    [setBrands]
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "billNumber">) => {
      let created: Transaction;
      setTransactions((prev) => {
        created = {
          ...tx,
          id: generateId(),
          billNumber: generateBillNumber(prev),
        };
        return [created, ...prev];
      });
      return created!;
    },
    [setTransactions]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [setTransactions]
  );

  const restoreTransaction = useCallback(
    (tx: Transaction) => {
      setTransactions((prev) => (prev.some((t) => t.id === tx.id) ? prev : [tx, ...prev]));
    },
    [setTransactions]
  );

  const addCostEntry = useCallback(
    (entry: Omit<CostOverheadEntry, "id">) => {
      setCostLedger((prev) => [{ ...entry, id: generateId() }, ...prev]);
    },
    [setCostLedger]
  );

  const removeCostEntry = useCallback(
    (id: string) => {
      setCostLedger((prev) => prev.filter((e) => e.id !== id));
    },
    [setCostLedger]
  );

  const restoreCostEntry = useCallback(
    (entry: CostOverheadEntry) => {
      setCostLedger((prev) => (prev.some((e) => e.id === entry.id) ? prev : [entry, ...prev]));
    },
    [setCostLedger]
  );

  const addProductionEntry = useCallback(
    (entry: Omit<ProductionEntry, "id">) => {
      setProductionLog((prev) => [{ ...entry, id: generateId() }, ...prev]);
    },
    [setProductionLog]
  );

  const removeProductionEntry = useCallback(
    (id: string) => {
      setProductionLog((prev) => prev.filter((e) => e.id !== id));
    },
    [setProductionLog]
  );

  const restoreProductionEntry = useCallback(
    (entry: ProductionEntry) => {
      setProductionLog((prev) =>
        prev.some((e) => e.id === entry.id) ? prev : [entry, ...prev]
      );
    },
    [setProductionLog]
  );

  const addGrindingEntry = useCallback(
    (entry: Omit<WheatGrindingLog, "id">) => {
      setGrindingLog((prev) => [{ ...entry, id: generateId() }, ...prev]);
    },
    [setGrindingLog]
  );

  const removeGrindingEntry = useCallback(
    (id: string) => {
      setGrindingLog((prev) => prev.filter((e) => e.id !== id));
    },
    [setGrindingLog]
  );

  const restoreGrindingEntry = useCallback(
    (entry: WheatGrindingLog) => {
      setGrindingLog((prev) => (prev.some((e) => e.id === entry.id) ? prev : [entry, ...prev]));
    },
    [setGrindingLog]
  );

  const logDeletion = useCallback(
    (entry: Omit<DeletionLogEntry, "id">) => {
      setDeletionLog((prev) => [{ ...entry, id: generateId() }, ...prev]);
    },
    [setDeletionLog]
  );

  const value = useMemo<AppStoreValue>(
    () => ({
      lastEnteredBy,
      setLastEnteredBy,
      brands,
      setBrands,
      addBrand,
      addPackagingSize,
      updatePackagingSize,
      removeBrand,
      removePackagingSize,
      transactions,
      setTransactions,
      addTransaction,
      removeTransaction,
      restoreTransaction,
      costLedger,
      setCostLedger,
      addCostEntry,
      removeCostEntry,
      restoreCostEntry,
      productionLog,
      setProductionLog,
      addProductionEntry,
      removeProductionEntry,
      restoreProductionEntry,
      grindingLog,
      setGrindingLog,
      addGrindingEntry,
      removeGrindingEntry,
      restoreGrindingEntry,
      deletionLog,
      logDeletion,
    }),
    [
      lastEnteredBy,
      setLastEnteredBy,
      brands,
      setBrands,
      addBrand,
      addPackagingSize,
      updatePackagingSize,
      removeBrand,
      removePackagingSize,
      transactions,
      setTransactions,
      addTransaction,
      removeTransaction,
      restoreTransaction,
      costLedger,
      setCostLedger,
      addCostEntry,
      removeCostEntry,
      restoreCostEntry,
      productionLog,
      setProductionLog,
      addProductionEntry,
      removeProductionEntry,
      restoreProductionEntry,
      grindingLog,
      setGrindingLog,
      addGrindingEntry,
      removeGrindingEntry,
      restoreGrindingEntry,
      deletionLog,
      logDeletion,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
