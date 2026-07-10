// Only lastEnteredBy remains local — it's a per-device UI convenience (remembers
// who's typing on this browser), not business data. Everything else now lives in
// Postgres (see store/AppStore.tsx).
export const STORAGE_KEYS = {
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
