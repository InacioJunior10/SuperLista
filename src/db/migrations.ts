import type { Db } from "./types";

export type Migration = { version: number; sql: string };

// Regras: nunca edite uma migração já publicada; adicione uma nova com version + 1.
// Dinheiro em centavos (INTEGER). Booleanos como 0/1.
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE lists (
        id           TEXT PRIMARY KEY NOT NULL,
        title        TEXT NOT NULL,
        market       TEXT,
        budget_cents INTEGER,
        created_at   TEXT NOT NULL
      );

      CREATE TABLE items (
        id               TEXT PRIMARY KEY NOT NULL,
        list_id          TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
        name             TEXT NOT NULL,
        category         TEXT NOT NULL DEFAULT 'outros',
        unit             TEXT NOT NULL DEFAULT 'un' CHECK (unit IN ('kg', 'un')),
        quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
        unit_price_cents INTEGER CHECK (unit_price_cents IS NULL OR unit_price_cents >= 0),
        checked          INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
        position         INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX idx_items_list ON items(list_id, position);
    `,
  },
  {
    // Todo item tem preço; o padrão é 0 (a UI mostra "Definir preço"). O default em código está em repository.ts.
    version: 2,
    sql: `UPDATE items SET unit_price_cents = 0 WHERE unit_price_cents IS NULL;`,
  },
  {
    // Compras finalizadas (checkout): snapshot dos itens pegos.
    version: 3,
    sql: `
      CREATE TABLE purchases (
        id             TEXT PRIMARY KEY NOT NULL,
        title          TEXT NOT NULL,
        market         TEXT,
        budget_cents   INTEGER,
        total_cents    INTEGER NOT NULL,
        item_count     INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        created_at     TEXT NOT NULL
      );

      CREATE TABLE purchase_items (
        id               TEXT PRIMARY KEY NOT NULL,
        purchase_id      TEXT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
        name             TEXT NOT NULL,
        category         TEXT NOT NULL,
        unit             TEXT NOT NULL,
        quantity         INTEGER NOT NULL,
        unit_price_cents INTEGER NOT NULL,
        total_cents      INTEGER NOT NULL
      );

      CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
      CREATE INDEX idx_purchase_items_name ON purchase_items(name);
    `,
  },
];

/** Aplica as migrações pendentes usando PRAGMA user_version. Idempotente. */
export async function migrate(db: Db, migrations: readonly Migration[] = MIGRATIONS): Promise<number> {
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let current = row?.user_version ?? 0;

  const pending = [...migrations].sort((a, b) => a.version - b.version).filter((m) => m.version > current);
  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
    current = migration.version;
  }
  return current;
}
