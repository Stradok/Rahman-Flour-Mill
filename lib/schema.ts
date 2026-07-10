import { sqliteTable, text, real, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["owner", "staff"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("users_username_idx").on(table.username)]
);

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const packagingSizes = sqliteTable("packaging_sizes", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull(),
  label: text("label").notNull(),
  weightKg: real("weight_kg").notNull(),
  basePrice: real("base_price").notNull(),
});

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    billNumber: text("bill_number").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    enteredBy: text("entered_by"),
    brandId: text("brand_id").notNull(),
    brandName: text("brand_name").notNull(),
    packagingSizeId: text("packaging_size_id").notNull(),
    packagingLabel: text("packaging_label").notNull(),
    weightKg: real("weight_kg").notNull(),
    unitPrice: real("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    subtotal: real("subtotal").notNull(),
    paymentMode: text("payment_mode").notNull(),
    paymentMethod: text("payment_method"),
    status: text("status").notNull(),
    customerName: text("customer_name"),
    customerCnic: text("customer_cnic"),
    customerPhone: text("customer_phone"),
    amountPaid: real("amount_paid"),
    creditAmountLeft: real("credit_amount_left"),
    returned: integer("returned", { mode: "boolean" }).default(false),
    returnedAt: integer("returned_at", { mode: "timestamp" }),
    returnedBy: text("returned_by"),
    returnReason: text("return_reason"),
  },
  (table) => [uniqueIndex("transactions_bill_number_idx").on(table.billNumber)]
);

export const costOverheadEntries = sqliteTable("cost_overhead_entries", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  enteredBy: text("entered_by"),
  wheatVolumeKg: real("wheat_volume_kg"),
  wheatRatePerKg: real("wheat_rate_per_kg"),
  supplierName: text("supplier_name"),
  vehicleNumberPlate: text("vehicle_number_plate"),
  category: text("category"),
  amount: real("amount").notNull(),
  note: text("note"),
});

export const productionEntries = sqliteTable("production_entries", {
  id: text("id").primaryKey(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  enteredBy: text("entered_by"),
  brandId: text("brand_id").notNull(),
  brandName: text("brand_name").notNull(),
  packagingSizeId: text("packaging_size_id").notNull(),
  packagingLabel: text("packaging_label").notNull(),
  weightKg: real("weight_kg").notNull(),
  bags: integer("bags").notNull(),
});

export const wheatGrindingLogs = sqliteTable("wheat_grinding_logs", {
  id: text("id").primaryKey(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  enteredBy: text("entered_by"),
  wheatGrindedKg: real("wheat_grinded_kg").notNull(),
  note: text("note"),
});

export const deletionLogEntries = sqliteTable("deletion_log_entries", {
  id: text("id").primaryKey(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }).notNull(),
  summary: text("summary").notNull(),
  deletedBy: text("deleted_by").notNull(),
  reason: text("reason").notNull(),
});

export const productChangeLogEntries = sqliteTable("product_change_log_entries", {
  id: text("id").primaryKey(),
  changedAt: integer("changed_at", { mode: "timestamp" }).notNull(),
  summary: text("summary").notNull(),
  changedBy: text("changed_by").notNull(),
});

export const returnLogEntries = sqliteTable("return_log_entries", {
  id: text("id").primaryKey(),
  returnedAt: integer("returned_at", { mode: "timestamp" }).notNull(),
  summary: text("summary").notNull(),
  returnedBy: text("returned_by").notNull(),
  reason: text("reason").notNull(),
});
