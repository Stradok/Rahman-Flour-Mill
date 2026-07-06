export const STORAGE_KEYS = {
  brands: "flourmill:v1:brands",
  transactions: "flourmill:v1:transactions",
  costLedger: "flourmill:v1:costLedger",
  productionLog: "flourmill:v1:productionLog",
  grindingLog: "flourmill:v1:grindingLog",
  lastEnteredBy: "flourmill:v1:lastEnteredBy",
} as const;

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
