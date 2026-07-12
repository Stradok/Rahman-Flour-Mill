import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, encryptDatabase, saveEncryptionPassword } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { users, brands, packagingSizes, transactions, costOverheadEntries, productionEntries, wheatGrindingLogs, deletionLogEntries, productChangeLogEntries, returnLogEntries } from "@/lib/schema";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbPassword, ownerName, ownerUsername, ownerPassword } = body;

    if (!dbPassword || !ownerName || !ownerUsername || !ownerPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sqliteDb = initializeDatabase();

    // Save the password for future use (encryption will be added later)
    saveEncryptionPassword(dbPassword);
    console.log("Database password saved");

    // Create initial table
    sqliteDb.exec("CREATE TABLE IF NOT EXISTS _init (id INTEGER)");

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS packaging_sizes (
        id TEXT PRIMARY KEY,
        brand_id TEXT NOT NULL,
        label TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        base_price REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        bill_number TEXT UNIQUE NOT NULL,
        created_at INTEGER NOT NULL,
        entered_by TEXT,
        brand_id TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        packaging_size_id TEXT NOT NULL,
        packaging_label TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        payment_mode TEXT NOT NULL,
        payment_method TEXT,
        status TEXT NOT NULL,
        customer_name TEXT,
        customer_cnic TEXT,
        customer_phone TEXT,
        amount_paid REAL,
        credit_amount_left REAL,
        returned INTEGER DEFAULT 0,
        returned_at INTEGER,
        returned_by TEXT,
        return_reason TEXT
      );

      CREATE TABLE IF NOT EXISTS cost_overhead_entries (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        entered_by TEXT,
        wheat_volume_kg REAL,
        wheat_rate_per_kg REAL,
        supplier_name TEXT,
        vehicle_number_plate TEXT,
        category TEXT,
        amount REAL NOT NULL,
        note TEXT
      );

      CREATE TABLE IF NOT EXISTS production_entries (
        id TEXT PRIMARY KEY,
        date INTEGER NOT NULL,
        entered_by TEXT,
        brand_id TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        packaging_size_id TEXT NOT NULL,
        packaging_label TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        bags INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wheat_grinding_logs (
        id TEXT PRIMARY KEY,
        date INTEGER NOT NULL,
        entered_by TEXT,
        wheat_grinded_kg REAL NOT NULL,
        note TEXT
      );

      CREATE TABLE IF NOT EXISTS deletion_log_entries (
        id TEXT PRIMARY KEY,
        deleted_at INTEGER NOT NULL,
        summary TEXT NOT NULL,
        deleted_by TEXT NOT NULL,
        reason TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product_change_log_entries (
        id TEXT PRIMARY KEY,
        changed_at INTEGER NOT NULL,
        summary TEXT NOT NULL,
        changed_by TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS return_log_entries (
        id TEXT PRIMARY KEY,
        returned_at INTEGER NOT NULL,
        summary TEXT NOT NULL,
        returned_by TEXT NOT NULL,
        reason TEXT NOT NULL
      );
    `);

    const ownerId = randomUUID();
    const passwordHash = hashPassword(ownerPassword);
    const now = Date.now();

    sqliteDb
      .prepare(
        `INSERT INTO users (id, name, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(ownerId, ownerName, ownerUsername, passwordHash, "owner", now);

    // Insert default settings
    sqliteDb
      .prepare(
        `INSERT INTO settings (key, value) VALUES (?, ?)`
      )
      .run("session_timeout_minutes", "30");

    sqliteDb
      .prepare(
        `INSERT INTO settings (key, value) VALUES (?, ?)`
      )
      .run("session_warning_minutes", "5");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Setup error:", err instanceof Error ? err.stack : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Setup failed" },
      { status: 500 }
    );
  }
}
