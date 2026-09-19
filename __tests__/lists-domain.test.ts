import { migrate } from "../src/db/migrations";
import { createListsRepository } from "../src/db/repository";
import { seedIfEmpty } from "../src/db/seed";
import {
  budgetStatus,
  cartTotalCents,
  CATEGORIES,
  checkedCount,
  estimatedTotalCents,
  groupByCategory,
  itemTotalCents,
  totalCount,
} from "../src/features/lists";
import type { ShoppingItem } from "../src/types/list";
import { formatBRL } from "../src/utils/money";
import { createTestDb } from "../test-utils/sqliteTestDb";

let n = 0;
const item = (o: Partial<ShoppingItem> = {}): ShoppingItem => ({
  id: `i${n++}`,
  name: "x",
  category: "outros",
  unit: "un",
  quantity: 1,
  unitPriceCents: 0, // padrão: todo item começa com preço 0
  checked: false,
  ...o,
});

describe("categorias", () => {
  it("ordem do PRD com outros por último", () => {
    expect(CATEGORIES.map((c) => c.key)).toEqual([
      "hortifruti",
      "laticinios",
      "padaria",
      "carnes",
      "mercearia",
      "limpeza",
      "outros",
    ]);
    expect(CATEGORIES[0].label).toBe("Hortifrúti & Feira");
    expect(CATEGORIES.find((c) => c.key === "mercearia")).toMatchObject({ label: "Mercearia & Grãos", chipLabel: "Mercearia" });
    expect(CATEGORIES.find((c) => c.key === "limpeza")?.label).toBe("Limpeza & Higiene");
  });
});

describe("totais", () => {
  it("un e kg", () => {
    expect(itemTotalCents(item({ quantity: 6, unitPriceCents: 499 }))).toBe(2994);
    expect(itemTotalCents(item({ unit: "kg", quantity: 500, unitPriceCents: 1590 }))).toBe(795);
  });
  it("item com preço padrão 0 não soma no total do topo", () => {
    const list = { items: [item(), item({ quantity: 2, unitPriceCents: 500 })] };
    expect(itemTotalCents(list.items[0])).toBe(0);
    expect(estimatedTotalCents(list)).toBe(1000);
  });
  it("estimatedTotalCents soma todos; cartTotalCents só os marcados; ambos reagem ao preço", () => {
    const a = item({ unitPriceCents: 1000, checked: true });
    const b = item({ unitPriceCents: 0, checked: true });
    expect(estimatedTotalCents({ items: [a, b] })).toBe(1000);
    expect(cartTotalCents({ items: [a, { ...b, unitPriceCents: 250 }] })).toBe(1250);
    expect(cartTotalCents({ items: [a, { ...b, unitPriceCents: 250, checked: false }] })).toBe(1000);
  });
  it("unidade g: quantidade em gramas, preço por kg (mesma fórmula do kg)", () => {
    const g = itemTotalCents(item({ unit: "g", quantity: 500, unitPriceCents: 4290 }));
    expect(g).toBe(2145);
    expect(g).toBe(itemTotalCents(item({ unit: "kg", quantity: 500, unitPriceCents: 4290 })));
  });
  it("arredondamento: 800 g x R$ 10,25/kg = R$ 8,20", () => {
    const t = itemTotalCents(item({ unit: "kg", quantity: 800, unitPriceCents: 1025 }));
    expect(t).toBe(820);
    expect(formatBRL(t)).toBe("R$ 8,20");
  });
  it("sem preço = 0 e lista vazia", () => {
    expect(itemTotalCents(item())).toBe(0);
    expect(cartTotalCents({ items: [] })).toBe(0);
    expect(estimatedTotalCents({ items: [] })).toBe(0);
  });
  it("marcar/desmarcar altera o total do carrinho", () => {
    const a = item({ unitPriceCents: 1000, checked: true });
    const b = item({ unitPriceCents: 500 });
    expect(cartTotalCents({ items: [a, b] })).toBe(1000);
    expect(cartTotalCents({ items: [a, { ...b, checked: true }] })).toBe(1500);
    expect(cartTotalCents({ items: [{ ...a, checked: false }, b] })).toBe(0);
    expect(estimatedTotalCents({ items: [a, b] })).toBe(1500);
  });
  it("contagens", () => {
    const items = [item({ checked: true }), item(), item({ checked: true })];
    expect(checkedCount({ items })).toBe(2);
    expect(totalCount({ items })).toBe(3);
  });
});

describe("agrupamento", () => {
  const items = [
    item({ category: "outros" }),
    item({ category: "carnes" }),
    item({ category: "hortifruti" }),
    item({ category: "carnes" }),
  ];
  it("ordem, omite vazias e conta", () => {
    const s = groupByCategory(items);
    expect(s.map((x) => x.category.key)).toEqual(["hortifruti", "carnes", "outros"]);
    expect(s[1].count).toBe(2);
    expect(s[1].countLabel).toBe("2 itens");
    expect(s[0].countLabel).toBe("1 item");
  });
  it("filtro por categoria", () => {
    expect(groupByCategory(items, "carnes").map((x) => x.category.key)).toEqual(["carnes"]);
    expect(groupByCategory(items, "limpeza")).toEqual([]);
    expect(groupByCategory(items, null)).toHaveLength(3);
  });
});

describe("meta", () => {
  const at = (cents: number) =>
    budgetStatus({ budgetCents: 10000, items: [item({ unitPriceCents: cents, checked: true })] });
  it("sem meta", () => {
    expect(budgetStatus({ items: [item({ unitPriceCents: 500, checked: true })] }).level).toBe("none");
  });
  it("só itens pegos contam para a meta", () => {
    const s = budgetStatus({ budgetCents: 10000, items: [item({ unitPriceCents: 9000 })] });
    expect(s).toEqual({ percent: 0, remainingCents: 10000, level: "ok" });
  });
  it("limites 79/80/100/101%", () => {
    expect(at(7900).level).toBe("ok");
    expect(at(8000).level).toBe("warning");
    expect(at(10000).level).toBe("warning");
    expect(at(10100).level).toBe("over");
    expect(at(10100).remainingCents).toBe(-100);
    expect(at(7900).percent).toBe(79);
    expect(at(7900).remainingCents).toBe(2100);
  });
});

describe("lista inicial", () => {
  it("41 itens, preços zerados, nada marcado, sem meta", async () => {
    const db = createTestDb();
    await migrate(db);
    const repo = createListsRepository(db);
    await seedIfEmpty(repo);
    const list = (await repo.listLists())[0];
    const full = (await repo.getList(list.id))!;
    expect(full.title).toBe("Lista de compras");
    expect(full.market).toBeUndefined();
    expect(full.budgetCents).toBeUndefined();
    expect(totalCount(full)).toBe(41);
    expect(checkedCount(full)).toBe(0);
    expect(cartTotalCents(full)).toBe(0);
    expect(estimatedTotalCents(full)).toBe(0);
    expect(full.items.every((i) => i.unitPriceCents === 0)).toBe(true);
    expect(budgetStatus(full).level).toBe("none");
    expect(full.items[0]).toMatchObject({ name: "Arroz", unit: "kg", quantity: 1000, category: "mercearia" });
    expect(full.items[10]).toMatchObject({ name: "Muçarela fatiada", unit: "g", quantity: 500, category: "laticinios" });
    expect(full.items[40].name).toMatch(/^Caixas grandes de suco/);
    expect(groupByCategory(full.items).map((s) => [s.category.key, s.count])).toEqual([
      ["hortifruti", 4],
      ["laticinios", 5],
      ["padaria", 1],
      ["carnes", 7],
      ["mercearia", 13],
      ["limpeza", 10],
      ["outros", 1],
    ]);
    db.close();
  });
});
