import Database from "better-sqlite3-multiple-ciphers";
import * as schema from "./schema";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

const DB_DIR = process.env.DB_PATH || (typeof window === "undefined" ? join(process.cwd(), "data") : "");
const DB_FILE = join(DB_DIR, "flour-mill.db");
const PASSWORD_FILE = join(DB_DIR, ".key");

let db: BetterSQLite3Database<typeof schema> | null = null;
let sqliteDb: Database.Database | null = null;
let isUnlocked = false;

export function initializeDatabase() {
  if (!DB_DIR) {
    throw new Error("Cannot initialize database: DB_DIR not available in browser");
  }

  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }

  if (!sqliteDb) {
    sqliteDb = new Database(DB_FILE, { fileMustExist: false, nativeBinding: undefined });
  }
  return sqliteDb;
}

export function saveEncryptionPassword(password: string): void {
  if (!DB_DIR) {
    throw new Error("Cannot save password: DB_DIR not available");
  }
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }
  writeFileSync(PASSWORD_FILE, password, { mode: 0o600 });
}

export function getStoredPassword(): string | null {
  if (!existsSync(PASSWORD_FILE)) {
    return null;
  }
  return readFileSync(PASSWORD_FILE, "utf-8");
}

export function unlockDatabase(password: string): boolean {
  try {
    if (!sqliteDb) {
      initializeDatabase();
    }
    sqliteDb!.pragma(`key='${password.replace(/'/g, "''")}'`);
    sqliteDb!.prepare("SELECT 1").get();
    isUnlocked = true;
    return true;
  } catch (err) {
    isUnlocked = false;
    return false;
  }
}

export function unlockWithStoredPassword(): boolean {
  const password = getStoredPassword();
  if (!password) {
    return false;
  }
  return unlockDatabase(password);
}

export function encryptDatabase(password: string): void {
  if (!sqliteDb) {
    throw new Error("Database not initialized");
  }
  sqliteDb.pragma(`rekey='${password.replace(/'/g, "''")}'`);
}

export function getDatabase() {
  if (!sqliteDb) {
    throw new Error("Database not unlocked. Call unlockDatabase first.");
  }
  if (!isUnlocked) {
    throw new Error("Database is locked. Call unlockDatabase first.");
  }
  if (!db) {
    db = drizzle(sqliteDb, { schema });
  }
  return db;
}

export function isDbUnlocked(): boolean {
  return isUnlocked;
}

export function dbExists(): boolean {
  return existsSync(DB_FILE);
}

export function closeDatabase(): void {
  if (db) {
    db = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
  isUnlocked = false;
}
