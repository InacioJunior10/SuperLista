import { cartTotalCents, itemTotalCents } from "@/features/lists/totals";
import { groupByCategory } from "@/features/lists/grouping";
import type { CategoryInfo } from "@/features/lists/categories";
import type { ShoppingItem, ShoppingList } from "@/types/list";

export type ReceiptLine = { item: ShoppingItem; totalCents: number };
export type ReceiptSection = { category: CategoryInfo; lines: ReceiptLine[]; subtotalCents: number };
export type ReceiptBudget = {
  budgetCents?: number;
  /** meta - total (negativo se acima); 0 sem meta */
  diffCents: number;
  level: "none" | "within" | "over";
};
export type Receipt = {
  sections: ReceiptSection[];
  totalCents: number;
  itemCount: number;
  budget: ReceiptBudget;
};

/** Recibo só com os itens marcados (pegos). */
export function buildReceipt(list: Pick<ShoppingList, "items" | "budgetCents">): Receipt {
  const checked = list.items.filter((i) => i.checked);
  const sections = groupByCategory(checked).map((s) => {
    const lines = s.items.map((item) => ({ item, totalCents: itemTotalCents(item) }));
    return {
      category: s.category,
      lines,
      subtotalCents: lines.reduce((sum, l) => sum + l.totalCents, 0),
    };
  });
  const totalCents = cartTotalCents(list);
  const budgetCents = list.budgetCents && list.budgetCents > 0 ? list.budgetCents : undefined;
  const budget: ReceiptBudget =
    budgetCents === undefined
      ? { diffCents: 0, level: "none" }
      : { budgetCents, diffCents: budgetCents - totalCents, level: totalCents > budgetCents ? "over" : "within" };
  return { sections, totalCents, itemCount: checked.length, budget };
}
