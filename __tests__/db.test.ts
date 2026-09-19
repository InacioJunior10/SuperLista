import { migrate, MIGRATIONS } from "../src/db/migrations";
import { createListsRepository, type ListsRepository } from "../src/db/repository";
import { ensureInitialList } from "../src/db/seed";
import { createTestDb } from "../test-utils/sqliteTestDb";

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
});

afterEach(() => db.close());

describe("migrate", () => {
  it("aplica todas as migrações e grava user_version", async () => {
    const latest = MIGRATIONS[MIGRATIONS.length - 1].version;
    const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    expect(row?.user_version).toBe(latest);
  });

  it("migração v2 converte preços nulos em 0", async () => {
    const legacy = createTestDb();
    await migrate(legacy, MIGRATIONS.slice(0, 1));
    await legacy.runAsync("INSERT INTO lists (id, title, created_at) VALUES ('l', 'L', 'x')");
    await legacy.runAsync("INSERT INTO items (id, list_id, name) VALUES ('i', 'l', 'Arroz')");
    expect(
      (await legacy.getFirstAsync<{ p: number | null }>("SELECT unit_price_cents AS p FROM items"))
        ?.p,
    ).toBeNull();

    await migrate(legacy);
    expect(
      (await legacy.getFirstAsync<{ p: number | null }>("SELECT unit_price_cents AS p FROM items"))
        ?.p,
    ).toBe(0);
    legacy.close();
  });

  it("é idempotente", async () => {
    const latest = MIGRATIONS[MIGRATIONS.length - 1].version;
    await expect(migrate(db)).resolves.toBe(latest);
  });

  it("faz rollback se uma migração falhar", async () => {
    const broken = [
      ...MIGRATIONS,
      { version: 99, sql: "CREATE TABLE ok (id TEXT); SELECT * FROM inexistente;" },
    ];
    await expect(migrate(db, broken)).rejects.toThrow();
    const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    expect(row?.user_version).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);
    const table = await db.getFirstAsync("SELECT name FROM sqlite_master WHERE name = 'ok'");
    expect(table).toBeNull();
  });
});

describe("lists", () => {
  it("cria e lê uma lista com meta em centavos", async () => {
    const created = await repo.createList({ title: "Feira", market: "Extra", budgetCents: 20000 });
    const found = await repo.getList(created.id);
    expect(found).toMatchObject({ title: "Feira", market: "Extra", budgetCents: 20000, items: [] });
  });

  it("atualiza e limpa campos opcionais", async () => {
    const { id } = await repo.createList({ title: "A", budgetCents: 100 });
    const updated = await repo.updateList(id, { title: "B", budgetCents: null });
    expect(updated?.title).toBe("B");
    expect(updated?.budgetCents).toBeUndefined();
  });

  it("apaga a lista e seus itens em cascata", async () => {
    const list = await repo.createList({ title: "X" });
    const item = await repo.addItem(list.id, { name: "Arroz" });
    await repo.deleteList(list.id);
    expect(await repo.getList(list.id)).toBeNull();
    expect(await repo.getItem(item.id)).toBeNull();
  });

  it("lista mais recentes primeiro, com itens", async () => {
    const a = await repo.createList({ title: "A" });
    const b = await repo.createList({ title: "B" });
    await repo.addItem(a.id, { name: "Leite" });
    const all = await repo.listLists();
    expect(all.map((l) => l.title)).toEqual(["B", "A"]);
    expect(all[1].items).toHaveLength(1);
    expect(all[0].id).toBe(b.id);
  });
});

describe("items", () => {
  it("usa defaults e mantém a ordem de inserção", async () => {
    const { id } = await repo.createList({ title: "L" });
    await repo.addItem(id, { name: "Um" });
    await repo.addItem(id, { name: "Dois", category: "carnes", unit: "kg", quantity: 800 });
    const list = await repo.getList(id);
    expect(list?.items.map((i) => i.name)).toEqual(["Um", "Dois"]);
    expect(list?.items[0]).toMatchObject({
      category: "outros",
      unit: "un",
      quantity: 1,
      checked: false,
    });
    expect(list?.items[1]).toMatchObject({ category: "carnes", unit: "kg", quantity: 800 });
  });

  it("preço começa em 0; define, altera e zera; marca como pego", async () => {
    const list = await repo.createList({ title: "L" });
    const item = await repo.addItem(list.id, { name: "Tomate", unit: "kg", quantity: 800 });
    expect(item.unitPriceCents).toBe(0);
    expect((await repo.getItem(item.id))?.unitPriceCents).toBe(0);

    const priced = await repo.updateItem(item.id, { unitPriceCents: 1025, checked: true });
    expect(priced).toMatchObject({ unitPriceCents: 1025, checked: true });

    const cleared = await repo.updateItem(item.id, { unitPriceCents: 0 });
    expect(cleared?.unitPriceCents).toBe(0);
    expect(cleared?.checked).toBe(true);
  });

  it("remove um item", async () => {
    const list = await repo.createList({ title: "L" });
    const item = await repo.addItem(list.id, { name: "Pão" });
    await repo.removeItem(item.id);
    expect((await repo.getList(list.id))?.items).toEqual([]);
  });

  it("rejeita unidade inválida e preço negativo", async () => {
    const list = await repo.createList({ title: "L" });
    await expect(repo.addItem(list.id, { name: "x", unit: "lt" as never })).rejects.toThrow();
    await expect(repo.addItem(list.id, { name: "y", unitPriceCents: -1 })).rejects.toThrow();
  });
});

describe("ensureInitialList", () => {
  it("semeia uma vez e não duplica", async () => {
    expect(await ensureInitialList(repo)).toBe(true);
    expect(await ensureInitialList(repo)).toBe(false);
    const lists = await repo.listLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].items).toHaveLength(41);
    expect(lists[0].budgetCents).toBeUndefined();
  });
});
