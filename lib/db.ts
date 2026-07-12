import Database from "better-sqlite3-multiple-ciphers";
import * as schema from "./schema";
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { timingSafeEqual } from "crypto";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

const DB_DIR = process.env.DB_PATH || join(process.cwd(), "data");
const DB_FILE = join(DB_DIR, "flour-mill.db");
const PASSWORD_FILE = join(DB_DIR, ".key");

// The dev server loads this module into several bundles (routes, proxy, auth).
// A module-level singleton would give each bundle its own connection with
// divergent key state — the exact cause of the SQLITE_NOTADB loop. globalThis
// is the only store shared across all of them.
interface DbState {
  sqlite: Database.Database | null;
  orm: BetterSQLite3Database<typeof schema> | null;
}
const g = globalThis as typeof globalThis & { __flourMillDb?: DbState };
if (!g.__flourMillDb) g.__flourMillDb = { sqlite: null, orm: null };
const state = g.__flourMillDb;

function escapeKey(password: string): string {
  return password.replace(/'/g, "''");
}

function assertReadable(db: Database.Database): void {
  db.prepare("SELECT count(*) AS n FROM sqlite_master").get();
}

export function dbExists(): boolean {
  return existsSync(DB_FILE);
}

export function getStoredPassword(): string | null {
  if (!existsSync(PASSWORD_FILE)) return null;
  const value = readFileSync(PASSWORD_FILE, "utf-8").trim();
  return value.length > 0 ? value : null;
}

export function saveEncryptionPassword(password: string): void {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  writeFileSync(PASSWORD_FILE, password, { mode: 0o600 });
}

/**
 * Opens (or returns) the single shared connection.
 * Never creates the file — only /api/setup may do that. This is what stops
 * a pre-setup page visit from leaving a junk DB behind that traps the app
 * in a login loop.
 */
function openConnection(): Database.Database {
  if (state.sqlite && state.sqlite.open) return state.sqlite;
  state.sqlite = null;
  state.orm = null;

  if (!existsSync(DB_FILE)) {
    throw new Error("DATABASE_NOT_SETUP: no database file — complete first-time setup at /setup");
  }

  const password = getStoredPassword();
  let db = new Database(DB_FILE, { fileMustExist: true });
  try {
    if (password) db.pragma(`key='${escapeKey(password)}'`);
    assertReadable(db);
  } catch {
    // Keyed read failed. Either the file predates encryption (plaintext DB
    // from an older setup) or it is genuinely corrupted. Never leave a
    // half-keyed connection alive — that poisons every later query.
    db.close();
    if (!password) {
      throw new Error("DATABASE_UNREADABLE: database file is corrupted — reset it at /recover");
    }
    db = new Database(DB_FILE, { fileMustExist: true });
    try {
      assertReadable(db); // plaintext and intact?
      db.pragma(`rekey='${escapeKey(password)}'`); // encrypt in place
      assertReadable(db);
      console.log("[db] migrated plaintext database to encrypted storage");
    } catch {
      db.close();
      throw new Error("DATABASE_UNREADABLE: file is corrupted or does not match the stored key — reset it at /recover");
    }
  }

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  state.sqlite = db;
  return db;
}

/** Raw connection for the few callers that need prepared statements directly. */
export function getSqlite(): Database.Database {
  return openConnection();
}

/** Drizzle ORM handle. Unlocking happens internally — callers never manage keys. */
export function getDatabase(): BetterSQLite3Database<typeof schema> {
  const sqlite = openConnection();
  if (!state.orm) state.orm = drizzle(sqlite, { schema });
  return state.orm;
}

/**
 * Creates a brand-new encrypted database, wiping any stale/corrupt remnants
 * (including WAL/SHM journals). The key is applied before the first write,
 * so the file is encrypted from its very first byte.
 */
export function createFreshDatabase(dbPassword: string): Database.Database {
  closeDatabase();
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  for (const file of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(file)) unlinkSync(file);
  }
  const db = new Database(DB_FILE);
  db.pragma(`key='${escapeKey(dbPassword)}'`);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  state.sqlite = db;
  state.orm = null;
  return db;
}

/** True only when the database exists, opens with the stored key, and has at least one user. */
export function isSetupComplete(): boolean {
  if (!dbExists()) return false;
  try {
    const db = openConnection();
    const table = db
      .prepare("SELECT count(*) AS n FROM sqlite_master WHERE type='table' AND name='users'")
      .get() as { n: number };
    if (table.n === 0) return false;
    const owners = db.prepare("SELECT count(*) AS n FROM users").get() as { n: number };
    return owners.n > 0;
  } catch {
    return false;
  }
}

/**
 * Verifies the database password for destructive operations (reset).
 * Prefers the stored key file; falls back to attempting a keyed read-only
 * open when the key file is missing.
 */
export function verifyDatabasePassword(candidate: string): boolean {
  if (!candidate) return false;
  const stored = getStoredPassword();
  if (stored) {
    const a = Buffer.from(stored);
    const b = Buffer.from(candidate);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  if (!dbExists()) return false;
  try {
    const probe = new Database(DB_FILE, { fileMustExist: true, readonly: true });
    try {
      probe.pragma(`key='${escapeKey(candidate)}'`);
      assertReadable(probe);
      return true;
    } finally {
      probe.close();
    }
  } catch {
    return false;
  }
}

/**
 * Re-encrypts the database under a new password and updates the key file.
 * Requires the current stored key to be valid (the connection must open).
 */
export function rekeyDatabase(newPassword: string): void {
  const db = openConnection();
  db.pragma(`rekey='${escapeKey(newPassword)}'`);
  assertReadable(db);
  saveEncryptionPassword(newPassword);
}

export function closeDatabase(): void {
  if (state.sqlite) {
    try {
      state.sqlite.close();
    } catch {
      // already closed
    }
  }
  state.sqlite = null;
  state.orm = null;
}

/**
 * Deletes every database artifact. The connection MUST be closed first —
 * Windows refuses to unlink open files, which matters for the .exe build.
 */
export function deleteDatabaseFiles(): void {
  closeDatabase();
  for (const file of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`, PASSWORD_FILE]) {
    if (existsSync(file)) unlinkSync(file);
  }
}

/** @deprecated kept for existing routes; opening the connection now unlocks automatically. */
export function unlockWithStoredPassword(): boolean {
  try {
    openConnection();
    return true;
  } catch {
    return false;
  }
}

export function isDbUnlocked(): boolean {
  return !!(state.sqlite && state.sqlite.open);
}
