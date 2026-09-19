import type { Category, ShoppingItem } from "../../types/list";
import { CATEGORIES, type CategoryInfo } from "./categories";

export type CategorySection = {
  category: CategoryInfo;
  items: ShoppingItem[];
  count: number;
  /** Ex.: "3 itens" */
  countLabel: string;
};

export function countLabel(count: number): string {
  return `${count} ${count === 1 ? "item" : "itens"}`;
}

/** Seções na ordem do PRD, omitindo vazias; filtro opcional por categoria (chips). */
export function groupByCategory(
  items: readonly ShoppingItem[],
  filter?: Category | null,
): CategorySection[] {
  return CATEGORIES.filter((c) => !filter || c.key === filter)
    .map((category) => {
      const inCat = items.filter((i) => i.category === category.key);
      return { category, items: inCat, count: inCat.length, countLabel: countLabel(inCat.length) };
    })
    .filter((s) => s.count > 0);
}
