import { MIGRATIONS, migrate } from "../src/db/migrations";
import { createListsRepository } from "../src/db/repository";
import { INITIAL_LIST_REVISION, syncInitialList } from "../src/db/seed";
import { createTestDb } from "../test-utils/sqliteTestDb";

// Fixture independente de seed.ts: [nome, quantity, unit] (kg/g em gramas), na ordem da lista do usuário.
const EXPECTED: readonly (readonly [string, number, string])[] = [
  ["Arroz", 1000, "kg"],
  ["Feijão", 3000, "kg"],
  ["Farinha de trigo sem fermento", 1000, "kg"],
  ["Sal", 1000, "kg"],
  ["Fermento para bolo", 1, "un"],
  ["Óleo de soja", 1, "un"],
  ["Fubá", 1000, "kg"],
  ["Sachês de molho de tomate Predileta", 4, "un"],
  ["Orégano", 1, "un"],
  ["Carne moída (acém ou músculo)", 1000, "kg"],
  ["Muçarela fatiada", 500, "g"],
  ["Presunto", 400, "g"],
  ["Linguiça calabresa grossa", 100, "g"],
  ["Peitos de frango", 5000, "kg"],
  ["Coxinha da asa", 4000, "kg"],
  ["Sobrecoxa", 4000, "kg"],
  ["Coxa grande", 4000, "kg"],
  ["Fígado de boi", 400, "g"],
  ["Sachê de requeijão forneável do grande", 100, "g"],
  ["Margarina", 100, "g"],
  ["Pão", 1, "un"],
  ["Caixas de leite", 3, "un"],
  ["Frutas da promoção", 1000, "kg"],
  ["Legumes da promoção", 100, "g"],
  ["Cebolas brancas", 4, "un"],
  ["Cabeças de alho", 4, "un"],
  ["Pacotes de macarrão", 2, "un"],
  ["Nescau", 1, "un"],
  ["Café", 100, "g"],
  ["Sabonete", 1, "un"],
  ["Sabonete para mim", 1, "un"],
  ["Desodorante para você", 1, "un"],
  ["Shampoo", 1, "un"],
  ["Condicionador", 1, "un"],
  ["Desinfetante", 2, "un"],
  ["Limpa pedra", 1, "un"],
  ["Sabão em pó", 1, "un"],
  ["Detergente", 6, "un"],
  ["Água sanitária", 1, "un"],
  ["Patês Jade", 6, "un"],
  ["Caixas grandes de suco (2 laranja, 2 abacaxi, uva, manga)", 6, "un"],
];

let db: ReturnType<typeof createTestDb>;
beforeEach(() => {
  db = createTestDb();
});
afterEach(() => db.close());

async function setup() {
  await migrate(db);
  return createListsRepository(db);
}

describe("lista inicial exata", () => {
  it("fixture tem 41 itens", () => {
    expect(EXPECTED).toHaveLength(41);
  });

  it("banco novo: uma lista com exatamente os itens, na ordem", async () => {
    const repo = await setup();
    expect(await syncInitialList(db, repo)).toBe(true);
    const lists = await repo.listLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].title).toBe("Lista de compras");
    expect(lists[0].market).toBeUndefined();
    expect(lists[0].budgetCents).toBeUndefined();
    expect(lists[0].items.map((i) => [i.name, i.quantity, i.unit])).toEqual(EXPECTED.map((e) => [...e]));
    expect(lists[0].items.every((i) => i.unitPriceCents === 0 && !i.checked)).toBe(true);
    const meta = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'initial_list_revision'");
    expect(meta?.value).toBe(String(INITIAL_LIST_REVISION));
  });

  it("é idempotente e preserva edições do usuário", async () => {
    const repo = await setup();
    await syncInitialList(db, repo);
    const [list] = await repo.listLists();
    await repo.updateItem(list.items[0].id, { unitPriceCents: 599, checked: true });
    await repo.addItem(list.id, { name: "Extra", unitPriceCents: 0, checked: false });

    expect(await syncInitialList(db, repo)).toBe(false);
    const [after] = await repo.listLists();
    expect(after.items).toHaveLength(42);
    expect(after.items[0]).toMatchObject({ unitPriceCents: 599, checked: true });
    expect(after.items[41].name).toBe("Extra");
  });

  it("atualização: dados antigos são substituídos; purchases intactas", async () => {
    const repo = await setup();
    for (const title of ["Compras do mês", "Minha lista"]) {
      const l = await repo.createList({ title });
      await repo.addItem(l.id, { name: "Velho A", unitPriceCents: 100, checked: true });
      await repo.addItem(l.id, { name: "Velho B", unitPriceCents: 0, checked: false });
    }
    await db.runAsync(
      "INSERT INTO purchases (id, title, total_cents, item_count, payment_method, created_at) VALUES ('p1', 'Feira', 100, 1, 'pix', 'x')",
    );

    expect(await syncInitialList(db, repo)).toBe(true);
    const lists = await repo.listLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].title).toBe("Lista de compras");
    expect(lists[0].items.map((i) => [i.name, i.quantity, i.unit])).toEqual(EXPECTED.map((e) => [...e]));
    expect(await db.getAllAsync("SELECT id FROM items")).toHaveLength(41);
    expect(await db.getAllAsync("SELECT id FROM purchases")).toHaveLength(1);
  });

  it("migrar de v5 para v6 preserva dados e cria app_meta", async () => {
    expect(await migrate(db, MIGRATIONS.slice(0, 5))).toBe(5);
    await db.runAsync("INSERT INTO lists (id, title, created_at) VALUES ('l1', 'Feira', 'x')");
    expect(await migrate(db)).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);
    expect(await db.getAllAsync("SELECT id FROM lists")).toHaveLength(1);
    expect(await db.getAllAsync("SELECT key FROM app_meta")).toEqual([]);
  });
});
