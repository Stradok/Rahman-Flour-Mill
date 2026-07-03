export const STORAGE_KEYS = {
  brands: "flourmill:v1:brands",
  transactions: "flourmill:v1:transactions",
  costLedger: "flourmill:v1:costLedger",
  wheatLog: "flourmill:v1:wheatLog",
} as const;

export const TARGET_MARGIN_PER_BAG = 600;

export const OVERHEAD_CATEGORY_LABELS: Record<string, string> = {
  logistics: "Logistics / Transport",
  electricity: "Electricity / Utilities",
  labor: "Labor",
  misc: "Miscellaneous",
};
