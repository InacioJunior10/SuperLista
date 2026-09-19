import { budgetStatus, estimatedTotalCents, groupByCategory } from "../src/features/lists";
import type { ShoppingItem } from "../src/types/list";

const CATS = ["hortifruti", "laticinios", "padaria", "carnes", "limpeza", "outros"] as const;
const make = (n: number): ShoppingItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `i${i}`,
    name: `Item ${i}`,
    category: CATS[i % CATS.length],
    unit: i % 2 ? "kg" : "un",
    quantity: i % 2 ? 500 + i : 1 + (i % 5),
    unitPriceCents: 100 + i,
    checked: i % 3 === 0,
  }));

describe("desempenho das funções puras (limites folgados)", () => {
  it.each([
    [200, 50],
    [1000, 100],
  ])("%i itens: total + agrupamento + meta em < %i ms", (n, limitMs) => {
    const items = make(n);
    const list = { items, budgetCents: 100000 };
    const start = performance.now();
    estimatedTotalCents(list);
    groupByCategory(items);
    budgetStatus(list);
    expect(performance.now() - start).toBeLessThan(limitMs);
  });
});
