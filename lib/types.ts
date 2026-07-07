export interface PackagingSize {
  id: string;
  label: string; // "20kg", "40kg", custom
  weightKg: number;
  basePrice: number; // retail price in Rs for this brand+size
}

export interface Brand {
  id: string;
  name: string;
  packagingSizes: PackagingSize[];
  createdAt: string;
}

export type PaymentMode = "full" | "credit";
export type PaymentMethod = "cash" | "digital";
export type TransactionStatus = "paid" | "credit-pending";

export interface Transaction {
  id: string;
  billNumber: string;
  createdAt: string; // user-editable datetime-local ("YYYY-MM-DDTHH:mm"), defaults to now
  enteredBy?: string;
  brandId: string;
  brandName: string;
  packagingSizeId: string;
  packagingLabel: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  paymentMode: PaymentMode;
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  customerName?: string;
  customerCnic?: string;
  customerPhone?: string; // for following up on partial/credit payments
  amountPaid?: number;
  creditAmountLeft?: number;
}

export type OverheadCategory =
  | "electricity"
  | "transport"
  | "bardana"
  | "unloading"
  | "packery"
  | "salary"
  | "telephone"
  | "millKhata"
  | "langarKhata";

export interface CostOverheadEntry {
  id: string;
  createdAt: string; // user-editable datetime-local ("YYYY-MM-DDTHH:mm"), defaults to now
  enteredBy?: string;
  wheatVolumeKg?: number;
  wheatRatePerKg?: number;
  supplierName?: string; // required for Raw Wheat entries
  vehicleNumberPlate?: string; // required for Raw Wheat entries
  category?: OverheadCategory;
  amount: number;
  note?: string;
}

export interface ProductionEntry {
  id: string;
  date: string; // user-editable datetime-local ("YYYY-MM-DDTHH:mm"), defaults to now
  enteredBy?: string;
  brandId: string;
  brandName: string; // snapshot at time of logging
  packagingSizeId: string;
  packagingLabel: string; // snapshot at time of logging
  weightKg: number;
  bags: number; // number of bags produced, manually entered
}

export interface WheatGrindingLog {
  id: string;
  date: string; // user-editable datetime-local ("YYYY-MM-DDTHH:mm"), defaults to now
  enteredBy?: string;
  wheatGrindedKg: number; // mill-wide, not tied to a brand — logged once per day
  note?: string;
}

export interface DeletionLogEntry {
  id: string;
  deletedAt: string; // datetime-local, at the moment the deletion was confirmed
  summary: string; // what was deleted, e.g. "Electricity — Rs 5,000"
  deletedBy: string; // typed name, required as an accountability signature
  reason: string; // typed reason, required
}
