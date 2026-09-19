import { act, render } from "@testing-library/react-native";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { useEffect } from "react";
import { ListsProvider, useShoppingList, type ShoppingListApi } from "@/features/lists/ListsProvider";

import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;
const holder: { current: ShoppingListApi | null } = { current: null };
const cur = () => holder.current as ShoppingListApi;

function Probe() {
  const value = useShoppingList();
  useEffect(() => {
    holder.current = value;
  });
  return null;
}

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
});
afterEach(() => db.close());

async function setup() {
  const list = await repo.createList({ title: "L" });
  const a = await repo.addItem(list.id, { name: "A", unit: "un", quantity: 2, unitPriceCents: 500 });
  const b = await repo.addItem(list.id, { name: "B", unit: "kg", quantity: 500, unitPriceCents: 4000 });
  await render(
    <ListsProvider repository={repo}>
      <Probe />
    </ListsProvider>,
  );
  await act(async () => undefined);
  return { a, b };
}

describe("total do topo = só itens pegos (recalcula em toda ação)", () => {
  it("começa em 0 e expõe pendingCount", async () => {
    await setup();
    expect(cur().cartTotalCents).toBe(0);
    expect(cur().estimatedTotalCents).toBe(3000);
    expect(cur().pendingCount).toBe(2);
  });

  it("marcar e desmarcar", async () => {
    const { a, b } = await setup();
    await act(() => cur().toggleItem(a.id));
    expect(cur().cartTotalCents).toBe(1000);
    expect(cur().pendingCount).toBe(1);
    await act(() => cur().toggleItem(b.id));
    expect(cur().cartTotalCents).toBe(3000);
    await act(() => cur().toggleItem(a.id));
    expect(cur().cartTotalCents).toBe(2000);
  });

  it("preço, quantidade e unidade", async () => {
    const { a, b } = await setup();
    await act(() => cur().toggleItem(a.id));
    await act(() => cur().toggleItem(b.id));
    await act(() => cur().setItemPrice(a.id, 600));
    expect(cur().cartTotalCents).toBe(1200 + 2000);
    await act(() => cur().setItemQuantity(a.id, 3));
    expect(cur().cartTotalCents).toBe(1800 + 2000);
    await act(() => cur().updateItem(b.id, { unit: "g", quantity: 250 }));
    expect(cur().cartTotalCents).toBe(1800 + 1000); // g: 250 g x R$ 40,00/kg
    await act(() => cur().updateItem(b.id, { unit: "un", quantity: 2 }));
    expect(cur().cartTotalCents).toBe(1800 + 8000);
  });

  it("adicionar, editar, remover e recalcular", async () => {
    const { a } = await setup();
    await act(() => cur().toggleItem(a.id));
    await act(() => cur().addItem({ name: "C", unit: "g", quantity: 400, unitPriceCents: 5000, checked: true }));
    expect(cur().cartTotalCents).toBe(1000 + 2000);
    expect(cur().totalCount).toBe(3);
    await act(() => cur().updateItem(a.id, { name: "A2", unitPriceCents: 100 }));
    expect(cur().cartTotalCents).toBe(200 + 2000);
    await act(() => cur().removeItem(a.id));
    expect(cur().cartTotalCents).toBe(2000);
    await act(() => cur().resetChecks());
    expect(cur().cartTotalCents).toBe(0);
    expect(cur().pendingCount).toBe(2);
  });

  it("meta compara com o total pego", async () => {
    const { a } = await setup();
    await act(() => cur().updateBudget(2000));
    expect(cur().budgetStatus).toMatchObject({ level: "ok", percent: 0, remainingCents: 2000 });
    await act(() => cur().toggleItem(a.id));
    expect(cur().budgetStatus).toMatchObject({ level: "ok", percent: 50, remainingCents: 1000 });
    await act(() => cur().updateBudget(1000));
    expect(cur().budgetStatus.level).toBe("warning");
    await act(() => cur().updateBudget(900));
    expect(cur().budgetStatus.level).toBe("over");
    await act(() => cur().updateBudget(null));
    expect(cur().budgetStatus.level).toBe("none");
  });
});
