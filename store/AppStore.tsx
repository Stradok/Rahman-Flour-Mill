"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { STORAGE_KEYS } from "@/lib/constants";
import { generateBillNumber, generateId } from "@/lib/id";
import type {
  Brand,
  CostOverheadEntry,
  PackagingSize,
  ProductionEntry,
  Transaction,
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
  addTransaction: (
    tx: Omit<Transaction, "id" | "billNumber" | "createdAt">
  ) => Transaction;

  costLedger: CostOverheadEntry[];
  setCostLedger: React.Dispatch<React.SetStateAction<CostOverheadEntry[]>>;
  addCostEntry: (entry: Omit<CostOverheadEntry, "id" | "createdAt">) => void;
  removeCostEntry: (id: string) => void;
  restoreCostEntry: (entry: CostOverheadEntry) => void;

  productionLog: ProductionEntry[];
  setProductionLog: React.Dispatch<React.SetStateAction<ProductionEntry[]>>;
  addProductionEntry: (entry: Omit<ProductionEntry, "id" | "createdAt">) => void;
  removeProductionEntry: (id: string) => void;
  restoreProductionEntry: (entry: ProductionEntry) => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
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
    (tx: Omit<Transaction, "id" | "billNumber" | "createdAt">) => {
      let created: Transaction;
      setTransactions((prev) => {
        created = {
          ...tx,
          id: generateId(),
          billNumber: generateBillNumber(prev),
          createdAt: new Date().toISOString(),
        };
        return [created, ...prev];
      });
      return created!;
    },
    [setTransactions]
  );

  const addCostEntry = useCallback(
    (entry: Omit<CostOverheadEntry, "id" | "createdAt">) => {
      setCostLedger((prev) => [
        { ...entry, id: generateId(), createdAt: new Date().toISOString() },
        ...prev,
      ]);
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
    (entry: Omit<ProductionEntry, "id" | "createdAt">) => {
      setProductionLog((prev) => [
        { ...entry, id: generateId(), createdAt: new Date().toISOString() },
        ...prev,
      ]);
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

  const value = useMemo<AppStoreValue>(
    () => ({
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
    }),
    [
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
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
