import { MIGRATIONS, migrate } from "../src/db/migrations";
import { createTestDb } from "../test-utils/sqliteTestDb";

describe("migrações", () => {
  it("versões inteiras, únicas e contíguas a partir de 1", () => {
    const versions = MIGRATIONS.map((m) => m.version);
    expect(versions.every(Number.isInteger)).toBe(true);
    expect(new Set(versions).size).toBe(versions.length);
    expect(versions).toEqual(versions.map((_, i) => i + 1));
  });

  it("do zero até a última cria todas as tabelas", async () => {
    const db = createTestDb();
    const version = await migrate(db);
    expect(version).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);
    const tables = await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'");
    const names = tables.map((t) => t.name);
    for (const t of ["lists", "items", "purchases", "purchase_items", "products", "app_meta"]) expect(names).toContain(t);
    db.close();
  });

  it("upgrade v1 -> última preserva dados e converte preço NULL em 0", async () => {
    const db = createTestDb();
    expect(await migrate(db, MIGRATIONS.slice(0, 1))).toBe(1);
    await db.runAsync("INSERT INTO lists (id, title, market, budget_cents, created_at) VALUES (?, ?, ?, ?, ?)", [
      "l1", "Feira", "Mercado X", 5000, "2026-01-01T00:00:00Z",
    ]);
    await db.runAsync(
      "INSERT INTO items (id, list_id, name, category, unit, quantity, unit_price_cents, checked, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["i1", "l1", "Tomate", "hortifruti", "kg", 800, null, 1, 0],
    );
    await db.runAsync(
      "INSERT INTO items (id, list_id, name, category, unit, quantity, unit_price_cents, checked, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["i2", "l1", "Leite", "laticinios", "un", 2, 550, 0, 1],
    );

    expect(await migrate(db)).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);

    const list = await db.getFirstAsync<{ title: string; market: string; budget_cents: number }>(
      "SELECT * FROM lists WHERE id = 'l1'",
    );
    expect(list).toMatchObject({ title: "Feira", market: "Mercado X", budget_cents: 5000 });
    const items = await db.getAllAsync<{ id: string; name: string; quantity: number; unit_price_cents: number; checked: number }>(
      "SELECT * FROM items ORDER BY position",
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ name: "Tomate", quantity: 800, unit_price_cents: 0, checked: 1 });
    expect(items[1]).toMatchObject({ name: "Leite", quantity: 2, unit_price_cents: 550 });
    db.close();
  });

  it("upgrade v4 -> v5 preserva dados e passa a aceitar unidade g", async () => {
    const db = createTestDb();
    expect(await migrate(db, MIGRATIONS.slice(0, 4))).toBe(4);
    await db.runAsync("INSERT INTO lists (id, title, created_at) VALUES (?, ?, ?)", ["l1", "Feira", "2026-01-01T00:00:00Z"]);
    await db.runAsync(
      "INSERT INTO items (id, list_id, name, category, unit, quantity, unit_price_cents, checked, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["i1", "l1", "Tomate", "hortifruti", "kg", 800, 1025, 1, 0],
    );
    await db.runAsync("INSERT INTO products (ean, name, category, unit, updated_at) VALUES (?, ?, ?, ?, ?)", [
      "789", "Leite", "laticinios", "un", "2026-01-01T00:00:00Z",
    ]);
    await expect(
      db.runAsync("INSERT INTO items (id, list_id, name, unit) VALUES ('x', 'l1', 'Presunto', 'g')"),
    ).rejects.toThrow();

    expect(await migrate(db, MIGRATIONS.slice(0, 5))).toBe(5);

    const items = await db.getAllAsync<{ name: string; quantity: number; unit_price_cents: number; checked: number }>(
      "SELECT * FROM items",
    );
    expect(items).toEqual([expect.objectContaining({ name: "Tomate", quantity: 800, unit_price_cents: 1025, checked: 1 })]);
    expect(await db.getAllAsync("SELECT * FROM products")).toHaveLength(1);
    await db.runAsync("INSERT INTO items (id, list_id, name, unit, quantity) VALUES ('y', 'l1', 'Presunto', 'g', 400)");
    await db.runAsync("INSERT INTO products (ean, name, unit, updated_at) VALUES ('1', 'Frios', 'g', 'x')");
    const idx = await db.getFirstAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE name = 'idx_items_list'");
    expect(idx).not.toBeNull();
    db.close();
  });
});
