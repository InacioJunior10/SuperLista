import { MIGRATIONS, migrate } from "../src/db/migrations";
import { createListsRepository, type ListsRepository } from "../src/db/repository";
import { ensureInitialList } from "../src/db/seed";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { ListsProvider, useShoppingList } from "../src/features/lists/ListsProvider";
import { clearAllData } from "../src/features/settings/clearAllData";
import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

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

const asTuples = (items: { name: string; quantity: number; unit: string }[]) =>
  items.map((i) => [i.name, i.quantity, i.unit]);

describe("lista inicial: só cria se não existir nenhuma lista", () => {
  it("fixture tem 41 itens", () => {
    expect(EXPECTED).toHaveLength(41);
  });

  it("banco vazio: uma lista com exatamente os itens, na ordem", async () => {
    const repo = await setup();
    expect(await ensureInitialList(repo)).toBe(true);
    const lists = await repo.listLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].title).toBe("Lista de compras");
    expect(lists[0].market).toBeUndefined();
    expect(lists[0].budgetCents).toBeUndefined();
    expect(asTuples(lists[0].items)).toEqual(EXPECTED.map((e) => [...e]));
    expect(lists[0].items.every((i) => i.unitPriceCents === 0 && !i.checked)).toBe(true);
    expect(await db.getAllAsync("SELECT id FROM items")).toHaveLength(41);
  });

  it("se já existe qualquer lista, não cria nem apaga nada", async () => {
    const repo = await setup();
    const old = await repo.createList({ title: "Compras do mês" });
    await repo.addItem(old.id, { name: "Velho", unitPriceCents: 100, checked: true });

    expect(await ensureInitialList(repo)).toBe(false);
    const lists = await repo.listLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].id).toBe(old.id);
    expect(lists[0].title).toBe("Compras do mês");
    expect(lists[0].items.map((i) => i.name)).toEqual(["Velho"]);
  });

  it("chamadas repetidas e concorrentes continuam com uma única lista", async () => {
    const repo = await setup();
    const results = await Promise.all([1, 2, 3, 4, 5].map(() => ensureInitialList(repo)));
    expect(results.every((r) => r === true)).toBe(true);
    expect(await ensureInitialList(repo)).toBe(false);
    expect(await ensureInitialList(repo)).toBe(false);
    expect(await repo.listLists()).toHaveLength(1);
    expect(await db.getAllAsync("SELECT id FROM items")).toHaveLength(41);
  });

  it("preserva edições do usuário entre aberturas", async () => {
    const repo = await setup();
    await ensureInitialList(repo);
    const [list] = await repo.listLists();
    await repo.updateItem(list.items[0].id, { unitPriceCents: 599, checked: true });
    await repo.addItem(list.id, { name: "Extra", unitPriceCents: 0, checked: false });

    expect(await ensureInitialList(repo)).toBe(false);
    const [after] = await repo.listLists();
    expect(after.items).toHaveLength(42);
    expect(after.items[0]).toMatchObject({ unitPriceCents: 599, checked: true });
    expect(after.items[41].name).toBe("Extra");
  });

  it("migrar de v5 para v6 preserva dados e mantém app_meta (sem uso)", async () => {
    expect(await migrate(db, MIGRATIONS.slice(0, 5))).toBe(5);
    await db.runAsync("INSERT INTO lists (id, title, created_at) VALUES ('l1', 'Feira', 'x')");
    expect(await migrate(db)).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);
    expect(await db.getAllAsync("SELECT id FROM lists")).toHaveLength(1);
    expect(await db.getAllAsync("SELECT key FROM app_meta")).toEqual([]);
  });
});

describe("lista inicial no provider e em Limpar dados", () => {
  const wrapperFor = (repo: ListsRepository) =>
    function Wrapper({ children }: { children: ReactNode }) {
      return <ListsProvider repository={repo}>{children}</ListsProvider>;
    };

  it("sem listas: cria a lista inicial (não 'Minha lista')", async () => {
    const repo = await setup();
    const { result } = await renderHook(() => useShoppingList(), { wrapper: wrapperFor(repo) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.list?.title).toBe("Lista de compras");
    expect(asTuples(result.current.list!.items)).toEqual(EXPECTED.map((e) => [...e]));
    expect(await repo.listLists()).toHaveLength(1);
  });

  it("run() duplicado (reload simultâneo) não cria duas listas", async () => {
    const repo = await setup();
    const { result } = await renderHook(() => useShoppingList(), { wrapper: wrapperFor(repo) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await clearAllData(repo);
    await act(async () => {
      await Promise.all([result.current.reload(), result.current.reload()]);
    });
    expect(await repo.listLists()).toHaveLength(1);
  });

  it("clearAllData + reload recria a lista inicial (uma só)", async () => {
    const repo = await setup();
    const old = await repo.createList({ title: "Compras do mês" });
    const { result } = await renderHook(() => useShoppingList(), { wrapper: wrapperFor(repo) });
    await waitFor(() => expect(result.current.list?.id).toBe(old.id));

    await clearAllData(repo);
    expect(await repo.listLists()).toHaveLength(0);
    await act(() => result.current.reload());

    const lists = await repo.listLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].title).toBe("Lista de compras");
    expect(lists[0].items).toHaveLength(41);
    expect(result.current.list?.id).toBe(lists[0].id);
  });
});