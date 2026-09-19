import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { ListsProvider, useShoppingList } from "@/features/lists/ListsProvider";

import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
});
afterEach(() => db.close());

async function setup(repository: ListsRepository = repo) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ListsProvider repository={repository}>{children}</ListsProvider>
  );
  const hook = await renderHook(() => useShoppingList(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

async function seedList() {
  const list = await repo.createList({ title: "Feira" });
  const a = await repo.addItem(list.id, { name: "Arroz", unitPriceCents: 500 });
  const b = await repo.addItem(list.id, { name: "Feijão" });
  return { list, a, b };
}

describe("useShoppingList", () => {
  it("cria 'Minha lista' quando não há listas", async () => {
    const { result } = await setup();
    expect(result.current.list?.title).toBe("Minha lista");
    expect((await repo.listLists()).length).toBe(1);
  });

  it("carrega a lista mais recente", async () => {
    const { list } = await seedList();
    const { result } = await setup();
    expect(result.current.list?.id).toBe(list.id);
    expect(result.current.totalCount).toBe(2);
  });

  it("toggleItem persiste e atualiza a contagem", async () => {
    const { a } = await seedList();
    const { result } = await setup();
    await act(() => result.current.toggleItem(a.id));
    expect(result.current.checkedCount).toBe(1);
    expect((await repo.getItem(a.id))?.checked).toBe(true);
  });

  it("setItemPrice soma TODOS os itens e persiste", async () => {
    const { b } = await seedList();
    const { result } = await setup();
    expect(result.current.estimatedTotalCents).toBe(500);
    await act(() => result.current.setItemPrice(b.id, 300));
    expect(result.current.estimatedTotalCents).toBe(800);
    expect((await repo.getItem(b.id))?.unitPriceCents).toBe(300);
  });

  it("setItemQuantity, addItem e removeItem", async () => {
    const { a } = await seedList();
    const { result } = await setup();
    await act(() => result.current.setItemQuantity(a.id, 3));
    expect(result.current.estimatedTotalCents).toBe(1500);
    await act(() => result.current.addItem({ name: "Leite", unitPriceCents: 100 }));
    expect(result.current.totalCount).toBe(3);
    expect((await repo.listLists())[0].items).toHaveLength(3);
    await act(() => result.current.removeItem(a.id));
    expect(result.current.totalCount).toBe(2);
    expect(await repo.getItem(a.id)).toBeNull();
  });

  it("updateBudget grava e limpa a meta", async () => {
    const { list } = await seedList();
    const { result } = await setup();
    await act(() => result.current.updateBudget(1000));
    expect(result.current.budgetStatus.level).toBe("ok");
    expect((await repo.getList(list.id))?.budgetCents).toBe(1000);
    await act(() => result.current.updateBudget(null));
    expect(result.current.budgetStatus.level).toBe("none");
    expect((await repo.getList(list.id))?.budgetCents).toBeUndefined();
  });

  it("resetChecks desmarca todos", async () => {
    const { list, a, b } = await seedList();
    await repo.updateItem(a.id, { checked: true });
    await repo.updateItem(b.id, { checked: true });
    const { result } = await setup();
    expect(result.current.checkedCount).toBe(2);
    await act(() => result.current.resetChecks());
    expect(result.current.checkedCount).toBe(0);
    expect((await repo.getList(list.id))?.items.every((i) => !i.checked)).toBe(true);
  });

  it("reverte e expõe erro quando a persistência falha", async () => {
    const { a } = await seedList();
    const failing = {
      ...repo,
      updateItem: jest.fn().mockRejectedValue(new Error("boom")),
    } as ListsRepository;
    const { result } = await setup(failing);
    await act(() => result.current.toggleItem(a.id));
    expect(result.current.checkedCount).toBe(0);
    expect(result.current.error?.message).toBe("boom");
  });

  it("updateItem persiste e reverte em erro", async () => {
    const { a } = await seedList();
    const { result } = await setup();
    await act(() => result.current.updateItem(a.id, { name: "Arroz integral", quantity: 3 }));
    const saved = (await repo.listLists())[0].items.find((i) => i.id === a.id);
    expect(saved?.name).toBe("Arroz integral");
    expect(saved?.quantity).toBe(3);

    const failing = { ...repo, updateItem: jest.fn().mockRejectedValue(new Error("boom")) } as ListsRepository;
    const h2 = await setup(failing);
    await act(() => h2.result.current.updateItem(a.id, { name: "X" }));
    expect(h2.result.current.list?.items.find((i) => i.id === a.id)?.name).toBe("Arroz integral");
    expect(h2.result.current.error?.message).toBe("boom");
  });

  it("updateListInfo persiste (mercado vazio limpa) e reverte em erro", async () => {
    await seedList();
    const { result } = await setup();
    await act(() => result.current.updateListInfo({ title: "Mês", market: "Extra" }));
    expect(result.current.list).toMatchObject({ title: "Mês", market: "Extra" });
    let saved = (await repo.listLists())[0];
    expect(saved).toMatchObject({ title: "Mês", market: "Extra" });
    await act(() => result.current.updateListInfo({ market: "" }));
    saved = (await repo.listLists())[0];
    expect(saved.market).toBeUndefined();
    expect(saved.title).toBe("Mês");

    const failing = { ...repo, updateList: jest.fn().mockRejectedValue(new Error("boom")) } as ListsRepository;
    const h2 = await setup(failing);
    await act(() => h2.result.current.updateListInfo({ title: "Outro" }));
    expect(h2.result.current.list?.title).toBe("Mês");
    expect(h2.result.current.error?.message).toBe("boom");
  });});
