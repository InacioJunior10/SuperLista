import * as SQLite from "expo-sqlite";

import { migrate } from "./migrations";
import { createListsRepository, type ListsRepository } from "./repository";
import { seedIfEmpty } from "./seed";
import type { Db, SqlParams } from "./types";

export const DATABASE_NAME = "superlista.db";

let pending: Promise<ListsRepository> | null = null;

// expo-sqlite exige `params` nos overloads; o contrato Db os torna opcionais.
function asDb(db: SQLite.SQLiteDatabase): Db {
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, [...params]),
    getAllAsync: <T>(sql: string, params: SqlParams = []) => db.getAllAsync<T>(sql, [...params]),
    getFirstAsync: <T>(sql: string, params: SqlParams = []) => db.getFirstAsync<T>(sql, [...params]),
    withTransactionAsync: (task) => db.withTransactionAsync(task),
  };
}

async function open(): Promise<ListsRepository> {
  const native = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await native.execAsync("PRAGMA journal_mode = WAL;");
  const db = asDb(native);
  await migrate(db);
  const repo = createListsRepository(db);
  if (__DEV__) await seedIfEmpty(repo); // dados de exemplo só em desenvolvimento
  return repo;
}

/** Abre o banco, aplica migrações e devolve o repositório. Singleton: chamadas repetidas reutilizam a mesma conexão. */
export function getListsRepository(): Promise<ListsRepository> {
  pending ??= open().catch((error) => {
    pending = null; // permite nova tentativa após falha
    throw error;
  });
  return pending;
}
