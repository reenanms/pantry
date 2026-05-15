import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const DEFAULT_DB_PATH = process.env.API_DB_PATH || './data/pantry.db';

type AppDb = ReturnType<typeof drizzle<typeof schema>>;

export function createDatabase(dbPath: string = DEFAULT_DB_PATH): { db: AppDb; sqlite: Database.Database } {
  ensureDirectory(dbPath);
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  ensureTables(sqlite);

  return { db, sqlite };
}

function ensureTables(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS route_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      key_field TEXT NOT NULL DEFAULT 'id',
      latency INTEGER NOT NULL DEFAULT 0,
      static_code INTEGER,
      is_static INTEGER NOT NULL DEFAULT 0,
      static_payload TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS path_idx ON route_configs(path);

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id INTEGER NOT NULL REFERENCES route_configs(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function ensureDirectory(dbPath: string): void {
  if (dbPath === ':memory:') return;
  mkdirSync(dirname(dbPath), { recursive: true });
}

export type AppDatabase = ReturnType<typeof createDatabase>['db'];
