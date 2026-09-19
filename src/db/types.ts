// Contrato mínimo de banco usado pela camada src/db.
// `SQLiteDatabase` do expo-sqlite satisfaz esta interface; nos testes usa-se um adaptador sobre node:sqlite.
export type SqlValue = string | number | null;
export type SqlParams = readonly SqlValue[];

export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlParams): Promise<unknown>;
  getAllAsync<T>(sql: string, params?: SqlParams): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: SqlParams): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
