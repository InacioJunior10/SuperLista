import * as SQLite from "expo-sqlite";

import { migrate } from "./migrations";
import { createListsRepository, type ListsRepository } from "./repository";
import { seedIfEmpty } from "./seed";
import type { Db, SqlParams } from "./types";

export const DATABASE_NAME = "superlista.db";

let pendingDb: Promise<Db> | null = null;
let pendingLists: Promise<ListsRepository> | null = null;

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

async function openDb(): Promise<Db> {
  const native = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await native.execAsync("PRAGMA journal_mode = WAL;");
  const db = asDb(native);
  await migrate(db);
  return db;
}

/**
 * Conexão única do app (singleton): abre o banco e aplica as migrações uma vez.
 * Novos repositórios devem obter o `Db` aqui, em arquivos próprios (ex.: `getPurchasesRepository`
 * em src/db/purchases.ts), em vez de editar este arquivo.
 */
export function getDb(): Promise<Db> {
  pendingDb ??= openDb().catch((error) => {
    pendingDb = null; // permite nova tentativa após falha
    throw error;
  });
  return pendingDb;
}

/** Repositório de listas. Em qualquer build, semeia a lista inicial se o banco estiver vazio. */
export function getListsRepository(): Promise<ListsRepository> {
  pendingLists ??= (async () => {
    const repo = createListsRepository(await getDb());
    await seedIfEmpty(repo);
    return repo;
  })().catch((error) => {
    pendingLists = null;
    throw error;
  });
  return pendingLists;
}
