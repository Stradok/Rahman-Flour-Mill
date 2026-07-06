export const STORAGE_KEYS = {
  brands: "flourmill:v1:brands",
  transactions: "flourmill:v1:transactions",
  costLedger: "flourmill:v1:costLedger",
  productionLog: "flourmill:v1:productionLog",
} as const;

export const TARGET_MARGIN_PER_BAG = 600;

export const OVERHEAD_CATEGORY_LABELS: Record<string, string> = {
  electricity: "Electricity",
  transport: "Transport",
  bardana: "Bardana (Bags)",
  unloading: "Unloading",
  packery: "Packery",
  salary: "Salary",
  telephone: "Telephone",
  millKhata: "Mill Khata",
  langarKhata: "Langar Khata",
};
