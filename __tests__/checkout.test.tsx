import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { migrate } from "@/db/migrations";
import { createPurchasesRepository, type PurchasesRepository } from "@/db/purchases";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { buildReceipt } from "@/features/checkout/receipt";
import { ListsProvider } from "@/features/lists/ListsProvider";
import type { ShoppingItem } from "@/types/list";

import Carrinho from "../app/(tabs)/carrinho";
import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
const mockPurchases = { repo: null as PurchasesRepository | null };
jest.mock("@/db/purchases-client", () => ({ getPurchasesRepository: async () => mockPurchases.repo }));

let db: ReturnType<typeof createTestDb>;
let purchases: PurchasesRepository;
let lists: ListsRepository;

beforeEach(async () => {
  jest.restoreAllMocks();
  db = createTestDb();
  await migrate(db);
  purchases = createPurchasesRepository(db);
  lists = createListsRepository(db);
  mockPurchases.repo = purchases;
});
afterEach(() => db.close());

const line = (name: string, unitPriceCents: number, quantity = 1) => ({
  name,
  category: "outros" as const,
  unit: "un" as const,
  quantity,
  unitPriceCents,
  totalCents: unitPriceCents * quantity,
});

describe("migração v3 e repositório de compras", () => {
  it("cria as tabelas", async () => {
    const p = await purchases.create({ title: "A", paymentMethod: "dinheiro", items: [line("Arroz", 500)] });
    expect(await db.getAllAsync("SELECT id FROM purchase_items")).toHaveLength(1);
    expect(p.id).toBeTruthy();
  });

  it("create calcula totais e getPurchase devolve itens", async () => {
    const p = await purchases.create({
      title: "A",
      market: "M",
      budgetCents: 5000,
      paymentMethod: "debito",
      items: [line("Arroz", 500, 2), line("Feijão", 800)],
    });
    expect(p.totalCents).toBe(1800);
    expect(p.itemCount).toBe(2);
    const got = await purchases.getPurchase(p.id);
    expect(got?.market).toBe("M");
    expect(got?.budgetCents).toBe(5000);
    expect(got?.items.map((i) => i.name)).toEqual(["Arroz", "Feijão"]);
    expect(await purchases.getPurchase("x")).toBeNull();
  });

  it("listPurchases: mais recentes primeiro", async () => {
    await purchases.create({ title: "Velha", paymentMethod: "dinheiro", items: [line("A", 1)] });
    await purchases.create({ title: "Nova", paymentMethod: "dinheiro", items: [line("A", 1)] });
    expect((await purchases.listPurchases()).map((p) => p.title)).toEqual(["Nova", "Velha"]);
  });

  it("transação: falha não grava a compra", async () => {
    const bad = { ...line("X", 1), quantity: null as unknown as number };
    await expect(purchases.create({ title: "T", paymentMethod: "vale", items: [bad] })).rejects.toThrow();
    expect(await purchases.listPurchases()).toHaveLength(0);
  });

  it("apagar compra remove itens (cascade)", async () => {
    const p = await purchases.create({ title: "A", paymentMethod: "dinheiro", items: [line("Arroz", 500)] });
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.runAsync("DELETE FROM purchases WHERE id = ?", [p.id]);
    expect(await db.getAllAsync("SELECT id FROM purchase_items")).toHaveLength(0);
  });

  it("priceHistory e productNames", async () => {
    await purchases.create({ title: "1", paymentMethod: "dinheiro", items: [line("Arroz", 500), line("Café", 900)] });
    await purchases.create({ title: "2", paymentMethod: "dinheiro", items: [line("arroz", 550)] });
    const h = await purchases.priceHistory("ARROZ");
    expect(h.map((x) => x.unitPriceCents)).toEqual([500, 550]);
    expect(h[0].unit).toBe("un");
    const names = await purchases.productNames();
    expect(names).toHaveLength(3);
    expect(names[2]).toBe("Café");
  });
});

describe("buildReceipt", () => {
  const item = (id: string, over: Partial<ShoppingItem>): ShoppingItem => ({
    id,
    name: id,
    category: "outros",
    unit: "un",
    quantity: 1,
    unitPriceCents: 1000,
    checked: true,
    ...over,
  });

  it("usa só marcados, com subtotais por categoria", () => {
    const r = buildReceipt({
      items: [
        item("a", { category: "carnes", quantity: 2 }),
        item("b", { category: "carnes" }),
        item("c", { category: "hortifruti", checked: false }),
        item("d", {}),
      ],
    });
    expect(r.itemCount).toBe(3);
    expect(r.totalCents).toBe(4000);
    expect(r.sections.map((s) => [s.category.key, s.subtotalCents])).toEqual([
      ["carnes", 3000],
      ["outros", 1000],
    ]);
  });

  it("comparativo com a meta", () => {
    const items = [item("a", {})];
    expect(buildReceipt({ items }).budget.level).toBe("none");
    expect(buildReceipt({ items, budgetCents: 1500 }).budget).toEqual({
      budgetCents: 1500,
      diffCents: 500,
      level: "within",
    });
    expect(buildReceipt({ items, budgetCents: 800 }).budget.level).toBe("over");
  });
});

describe("tela Carrinho", () => {
  async function setup(budgetCents?: number) {
    const list = await lists.createList({ title: "Minha lista", budgetCents });
    await lists.addItem(list.id, { name: "Arroz", unitPriceCents: 1000, quantity: 2, checked: true });
    await lists.addItem(list.id, { name: "Feijão", unitPriceCents: 800, checked: false });
    await render(
      <ListsProvider repository={lists}>
        <Carrinho />
      </ListsProvider>,
    );
    return list;
  }

  it("mostra só itens marcados e o total", async () => {
    await setup();
    expect(await screen.findByText("Arroz")).toBeTruthy();
    expect(screen.queryByText("Feijão")).toBeNull();
    expect(screen.getAllByText("R$ 20,00").length).toBeGreaterThan(0);
  });

  it("desabilita Finalizar sem marcados", async () => {
    const list = await lists.createList({ title: "L" });
    await lists.addItem(list.id, { name: "Arroz", unitPriceCents: 1000 });
    await render(
      <ListsProvider repository={lists}>
        <Carrinho />
      </ListsProvider>,
    );
    expect(await screen.findByText(/Nenhum item pego ainda/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Finalizar Compra" })).toBeDisabled();
  });

  it("comparativo dentro da meta", async () => {
    await setup(5000);
    expect(await screen.findByText("Dentro da meta: sobram R$ 30,00")).toBeTruthy();
  });

  it("comparativo acima da meta", async () => {
    await setup(1500);
    expect(await screen.findByText("Acima da meta em R$ 5,00")).toBeTruthy();
  });

  it("confirmar cria a compra e remove os marcados", async () => {
    const list = await setup();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const user = userEvent.setup();
    await user.press(await screen.findByRole("button", { name: "Crédito" }));
    await user.press(screen.getByRole("button", { name: "Finalizar Compra" }));
    const buttons = alert.mock.calls[0][2]!;
    await act(async () => {
      await buttons.find((b) => b.text === "Finalizar")!.onPress!();
    });
    await waitFor(async () => expect(await purchases.listPurchases()).toHaveLength(1));
    const [p] = await purchases.listPurchases();
    expect(p.paymentMethod).toBe("credito");
    expect(p.totalCents).toBe(2000);
    await waitFor(async () => expect((await lists.getList(list.id))!.items.map((i) => i.name)).toEqual(["Feijão"]));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Compra finalizada", expect.any(String)));
  });

  it("cancelar não faz nada", async () => {
    await setup();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const user = userEvent.setup();
    await user.press(await screen.findByRole("button", { name: "Finalizar Compra" }));
    const cancel = alert.mock.calls[0][2]!.find((b) => b.text === "Cancelar")!;
    expect(cancel.onPress).toBeUndefined();
    expect(await purchases.listPurchases()).toHaveLength(0);
  });
});
