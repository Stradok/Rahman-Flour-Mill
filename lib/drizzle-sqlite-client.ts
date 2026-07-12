// Minimal reimplementation of drizzle-orm/better-sqlite3's `drizzle()` for an
// already-constructed client. drizzle-orm's own `better-sqlite3/driver.js`
// does `import Client from "better-sqlite3"` at module scope, which forces
// Node to resolve the real `better-sqlite3` native package even though we
// only ever pass in an already-built `better-sqlite3-multiple-ciphers`
// instance (API-compatible, never `new Client()`'d here). That import used
// to fail the production build on Windows when the plain `better-sqlite3`
// package had no prebuilt binary for the installed Node version and no
// Python/MSVC toolchain was present to compile it from source. Building the
// same wiring from `drizzle-orm/better-sqlite3/session` (type-only import of
// `better-sqlite3`, erased at compile time) avoids that dependency entirely.
import { entityKind, DefaultLogger } from "drizzle-orm";
import { createTableRelationsHelpers, extractTablesRelationalConfig } from "drizzle-orm/relations";
import { BaseSQLiteDatabase, SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { BetterSQLiteSession } from "drizzle-orm/better-sqlite3/session";
import type { Database as MultipleCiphersDatabase } from "better-sqlite3-multiple-ciphers";
import type { DrizzleConfig } from "drizzle-orm";

export class BetterSQLite3Database<
  TSchema extends Record<string, unknown> = Record<string, never>,
> extends BaseSQLiteDatabase<"sync", unknown, TSchema> {
  static override readonly [entityKind]: string = "BetterSQLite3Database";
}

export function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(
  client: MultipleCiphersDatabase,
  config: DrizzleConfig<TSchema> = {},
): BetterSQLite3Database<TSchema> {
  const dialect = new SQLiteSyncDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger();
  } else if (config.logger !== false) {
    logger = config.logger;
  }

  let schema;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = new BetterSQLiteSession(client as any, dialect, schema as any, { logger }) as any;
  const db = new BetterSQLite3Database<TSchema>("sync", dialect, session, schema as any);
  (db as unknown as { $client: MultipleCiphersDatabase }).$client = client;
  return db;
}
