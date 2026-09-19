import type { Db, SqlParams } from "../src/db/types";

type Row = Record<string, unknown>;
type NodeSqlite = typeof import("node:sqlite");

// process.getBuiltinModule: o resolver do Jest ainda não conhece módulos "node:"-only como node:sqlite.
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as NodeSqlite;

/** Banco SQLite real em memória (node:sqlite) com a mesma interface assíncrona do expo-sqlite. */
export function createTestDb(): Db & { close(): void } {
  const raw = new DatabaseSync(":memory:");
  const bind = (params?: SqlParams) => [...(params ?? [])];

  return {
    async execAsync(sql) {
      raw.exec(sql);
    },
    async runAsync(sql, params) {
      return raw.prepare(sql).run(...bind(params));
    },
    async getAllAsync<T>(sql: string, params?: SqlParams) {
      return raw.prepare(sql).all(...bind(params)).map((row: Row) => ({ ...row })) as T[];
    },
    async getFirstAsync<T>(sql: string, params?: SqlParams) {
      const row = raw.prepare(sql).get(...bind(params));
      return row ? ({ ...row } as T) : null;
    },
    async withTransactionAsync(task) {
      raw.exec("BEGIN");
      try {
        await task();
        raw.exec("COMMIT");
      } catch (error) {
        raw.exec("ROLLBACK");
        throw error;
      }
    },
    close: () => raw.close(),
  };
}
