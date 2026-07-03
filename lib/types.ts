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
  createdAt: string;
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
  amountPaid?: number;
  creditAmountLeft?: number;
}

export type OverheadCategory = "logistics" | "electricity" | "labor" | "misc";

export interface CostOverheadEntry {
  id: string;
  createdAt: string;
  wheatVolumeKg?: number;
  wheatRatePerKg?: number;
  category?: OverheadCategory;
  amount: number;
  note?: string;
}

export interface WheatInventoryLog {
  id: string;
  date: string; // YYYY-MM-DD
  wheatReceivedKg?: number;
  wheatGrindedKg: number;
  attaProducedKg: number;
  attaIssuedKg: number;
  createdAt: string;
}
