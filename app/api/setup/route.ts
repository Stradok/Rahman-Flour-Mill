import { NextRequest, NextResponse } from "next/server";
import {
  createFreshDatabase,
  deleteDatabaseFiles,
  isSetupComplete,
  saveEncryptionPassword,
} from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { randomUUID } from "crypto";

const USERNAME_PATTERN = /^[a-z0-9_.-]{3,32}$/;

const SCHEMA_SQL = `
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE packaging_sizes (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    label TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    base_price REAL NOT NULL
  );

  CREATE TABLE transactions (
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

  CREATE TABLE cost_overhead_entries (
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

  CREATE TABLE production_entries (
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

  CREATE TABLE wheat_grinding_logs (
    id TEXT PRIMARY KEY,
    date INTEGER NOT NULL,
    entered_by TEXT,
    wheat_grinded_kg REAL NOT NULL,
    note TEXT
  );

  CREATE TABLE deletion_log_entries (
    id TEXT PRIMARY KEY,
    deleted_at INTEGER NOT NULL,
    summary TEXT NOT NULL,
    deleted_by TEXT NOT NULL,
    reason TEXT NOT NULL
  );

  CREATE TABLE product_change_log_entries (
    id TEXT PRIMARY KEY,
    changed_at INTEGER NOT NULL,
    summary TEXT NOT NULL,
    changed_by TEXT NOT NULL
  );

  CREATE TABLE return_log_entries (
    id TEXT PRIMARY KEY,
    returned_at INTEGER NOT NULL,
    summary TEXT NOT NULL,
    returned_by TEXT NOT NULL,
    reason TEXT NOT NULL
  );

  CREATE INDEX idx_transactions_created_at ON transactions (created_at);
  CREATE INDEX idx_transactions_bill_number ON transactions (bill_number);
  CREATE INDEX idx_production_entries_date ON production_entries (date);
  CREATE INDEX idx_cost_overhead_created_at ON cost_overhead_entries (created_at);
  CREATE INDEX idx_grinding_logs_date ON wheat_grinding_logs (date);
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbPassword, ownerName, ownerUsername, ownerPassword } = body as Record<string, string>;

    if (!dbPassword || !ownerName?.trim() || !ownerUsername || !ownerPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (dbPassword.length < 8) {
      return NextResponse.json(
        { error: "Database password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (ownerPassword.length < 6) {
      return NextResponse.json(
        { error: "Owner password must be at least 6 characters" },
        { status: 400 }
      );
    }
    const username = ownerUsername.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-32 characters: letters, numbers, dot, dash or underscore" },
        { status: 400 }
      );
    }

    // Refuse to overwrite a working system. A corrupt or user-less leftover
    // file does NOT count as set up — createFreshDatabase wipes it below.
    if (isSetupComplete()) {
      return NextResponse.json(
        { error: "System is already set up. Reset the database first if you want to start over." },
        { status: 409 }
      );
    }

    const sqliteDb = createFreshDatabase(dbPassword);
    try {
      const initialize = sqliteDb.transaction(() => {
        sqliteDb.exec(SCHEMA_SQL);

        sqliteDb
          .prepare(
            "INSERT INTO users (id, name, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .run(
            randomUUID(),
            ownerName.trim(),
            username,
            hashPassword(ownerPassword),
            "owner",
            Date.now()
          );

        const insertSetting = sqliteDb.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
        insertSetting.run("session_timeout_minutes", "30");
        insertSetting.run("session_warning_minutes", "5");
        insertSetting.run("app_version", "0.1.0");
      });
      initialize();
      saveEncryptionPassword(dbPassword);
    } catch (err) {
      // Never leave a half-built database behind — that is exactly the
      // state that traps the app between /setup and /login.
      deleteDatabaseFiles();
      throw err;
    }

    console.log(`[setup] database created; owner account '${username}' ready`);
    return NextResponse.json({ success: true, username });
  } catch (err) {
    console.error("Setup error:", err instanceof Error ? err.stack : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Setup failed" },
      { status: 500 }
    );
  }
}
