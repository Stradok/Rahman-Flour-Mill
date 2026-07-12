#!/usr/bin/env node
/**
 * Demo Data Generator for Al Rehman Flour Mills
 * Generates realistic sample data for testing and presentation
 */

import { getSqlite } from "@/lib/db";
import { randomUUID } from "crypto";

interface DemoDataOptions {
  days?: number; // Number of days of history to generate
  sales?: number; // Approximate number of sales to generate
  verbose?: boolean; // Print logs
}

const BRANDS = [
  { name: "Premium Atta", id: randomUUID() },
  { name: "Standard Flour", id: randomUUID() },
  { name: "Chakki Atta", id: randomUUID() },
];

const SIZES = [
  { label: "10kg", weight: 10, price: 250 },
  { label: "20kg", weight: 20, price: 450 },
  { label: "40kg", weight: 40, price: 800 },
];

const SUPPLIERS = [
  "Malik Wheat Co.",
  "Khan Brothers Suppliers",
  "Rehman Grains",
  "Ahmed & Sons",
];

const EXPENSES = {
  electricity: 5000,
  transport: 3000,
  bardana: 2000,
  unloading: 1500,
  packery: 2500,
  salary: 15000,
  telephone: 500,
  mill_khata: 1000,
  langar_khata: 2000,
};

function log(message: string, options?: DemoDataOptions) {
  if (options?.verbose !== false) {
    console.log(`[Demo Data] ${message}`);
  }
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo: number): number {
  const now = Date.now();
  const millisPerDay = 24 * 60 * 60 * 1000;
  const randomDays = Math.random() * daysAgo;
  return now - randomDays * millisPerDay;
}

export async function generateDemoData(options: DemoDataOptions = {}) {
  const days = options.days || 30;
  const targetSales = options.sales || 50;
  const db = getSqlite();

  log(`Generating demo data for ${days} days...`, options);

  try {
    // 1. Clear existing data (optional - uncomment if needed)
    // db.exec("DELETE FROM transactions");
    // db.exec("DELETE FROM production_entries");
    // db.exec("DELETE FROM cost_overhead_entries");
    // db.exec("DELETE FROM wheat_grinding_logs");

    // 2. Add brands and sizes
    log("Creating brands and package sizes...", options);
    for (const brand of BRANDS) {
      db.prepare(
        "INSERT OR IGNORE INTO brands (id, name, created_at) VALUES (?, ?, ?)"
      ).run(brand.id, brand.name, Date.now());

      for (const size of SIZES) {
        const sizeId = randomUUID();
        db.prepare(
          `INSERT OR IGNORE INTO packaging_sizes
           (id, brand_id, label, weight_kg, base_price)
           VALUES (?, ?, ?, ?, ?)`
        ).run(sizeId, brand.id, size.label, size.weight, size.price);
      }
    }

    // 3. Generate production entries
    log("Generating production entries...", options);
    for (let d = 0; d < days; d++) {
      const date = Math.floor(getRandomDate(d) / 1000);
      for (const brand of BRANDS) {
        for (const size of SIZES) {
          const bags = randomBetween(50, 300);
          const sizeRecord = db
            .prepare(
              "SELECT id FROM packaging_sizes WHERE brand_id = ? AND weight_kg = ?"
            )
            .get(brand.id, size.weight) as any;

          if (sizeRecord) {
            db.prepare(
              `INSERT INTO production_entries
               (id, date, entered_by, brand_id, brand_name, packaging_size_id, packaging_label, weight_kg, bags)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(
              randomUUID(),
              date,
              "System",
              brand.id,
              brand.name,
              sizeRecord.id,
              size.label,
              bags * size.weight,
              bags
            );
          }
        }
      }
    }

    // 4. Generate sales transactions
    log("Generating sales transactions...", options);
    let billNumber = 1;
    for (let i = 0; i < targetSales; i++) {
      const d = randomBetween(0, days - 1);
      const date = Math.floor(getRandomDate(d) / 1000);
      const brand = BRANDS[randomBetween(0, BRANDS.length - 1)];
      const size = SIZES[randomBetween(0, SIZES.length - 1)];
      const quantity = randomBetween(5, 50);
      const subtotal = quantity * size.price;
      const isCredit = Math.random() > 0.7; // 30% chance of credit
      const amountPaid = isCredit ? randomBetween(0, subtotal) : subtotal;

      const sizeRecord = db
        .prepare(
          "SELECT id FROM packaging_sizes WHERE brand_id = ? AND weight_kg = ?"
        )
        .get(brand.id, size.weight) as any;

      if (sizeRecord) {
        db.prepare(
          `INSERT INTO transactions
           (id, bill_number, created_at, entered_by, brand_id, brand_name, packaging_size_id,
            packaging_label, weight_kg, unit_price, quantity, subtotal, payment_mode,
            payment_method, status, customer_name, customer_cnic, customer_phone,
            amount_paid, credit_amount_left, returned)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          randomUUID(),
          `BILL-${String(billNumber).padStart(4, "0")}`,
          date,
          "Sales Team",
          brand.id,
          brand.name,
          sizeRecord.id,
          size.label,
          quantity * size.weight,
          size.price,
          quantity,
          subtotal,
          isCredit ? "Credit" : "Cash",
          isCredit ? undefined : "Cash",
          isCredit && amountPaid === 0 ? "Pending" : amountPaid >= subtotal ? "Paid" : "Partial",
          isCredit
            ? ["Ahmed Khan", "Fatima Ali", "Hassan Malik", "Zara Ahmed"][randomBetween(0, 3)]
            : null,
          isCredit ? `${randomBetween(10000, 99999)}-${randomBetween(100000, 999999)}-${randomBetween(1, 9)}` : null,
          isCredit ? `03${randomBetween(100000000, 999999999)}` : null,
          amountPaid,
          isCredit ? subtotal - amountPaid : 0,
          0
        );
        billNumber++;
      }
    }

    // 5. Generate cost/overhead entries
    log("Generating expenses...", options);
    for (let d = 0; d < days; d += 5) {
      // Every 5 days
      const date = Math.floor(getRandomDate(d) / 1000);
      for (const [category, baseAmount] of Object.entries(EXPENSES)) {
        const amount = baseAmount + randomBetween(-baseAmount * 0.2, baseAmount * 0.2);
        db.prepare(
          `INSERT INTO cost_overhead_entries
           (id, created_at, entered_by, category, amount, note)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          randomUUID(),
          date,
          "Accounts",
          category,
          Math.round(amount),
          `Monthly ${category} expense`
        );
      }
    }

    // 6. Generate wheat purchases
    log("Generating raw wheat purchases...", options);
    for (let d = 0; d < days; d += 3) {
      const date = Math.floor(getRandomDate(d) / 1000);
      const volume = randomBetween(500, 2000);
      const rate = randomBetween(40, 60);
      const supplier = SUPPLIERS[randomBetween(0, SUPPLIERS.length - 1)];
      const vehicleNumbers = [
        "KHI-1234",
        "KHI-5678",
        "KHI-9012",
        "KHI-3456",
        "KHI-7890",
      ];

      db.prepare(
        `INSERT INTO cost_overhead_entries
         (id, created_at, entered_by, wheat_volume_kg, wheat_rate_per_kg,
          supplier_name, vehicle_number_plate, category, amount, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        randomUUID(),
        date,
        "Procurement",
        volume,
        rate,
        supplier,
        vehicleNumbers[randomBetween(0, vehicleNumbers.length - 1)],
        "Raw Wheat",
        volume * rate,
        `Wheat purchase from ${supplier}`
      );
    }

    // 7. Generate daily grinding logs
    log("Generating daily grinding logs...", options);
    for (let d = 0; d < days; d++) {
      const date = Math.floor(getRandomDate(d) / 1000);
      const grinded = randomBetween(800, 1500);

      db.prepare(
        `INSERT INTO wheat_grinding_logs
         (id, date, entered_by, wheat_grinded_kg, note)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        randomUUID(),
        date,
        "Mill Operator",
        grinded,
        `Daily grinding operation`
      );
    }

    log("✅ Demo data generated successfully!", options);
    log(`Generated:`, options);
    log(`  - ${BRANDS.length} brands with ${BRANDS.length * SIZES.length} sizes`, options);
    log(`  - ~${days * BRANDS.length * SIZES.length} production entries`, options);
    log(`  - ${targetSales} sales transactions`, options);
    log(`  - ${Math.floor(days / 5) * Object.keys(EXPENSES).length} expense entries`, options);
    log(`  - ${Math.floor(days / 3)} wheat purchases`, options);
    log(`  - ${days} grinding logs`, options);

    return { success: true, recordsGenerated: targetSales + days * 10 };
  } catch (error) {
    console.error("❌ Error generating demo data:", error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: DemoDataOptions = {
    days: parseInt(args[0]) || 30,
    sales: parseInt(args[1]) || 50,
    verbose: !args.includes("--quiet"),
  };

  generateDemoData(options)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default generateDemoData;
