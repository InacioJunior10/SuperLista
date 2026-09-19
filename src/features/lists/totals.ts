import { priceByWeight } from "../../utils/money";
import type { ShoppingItem, ShoppingList } from "../../types/list";

type WithItems = Pick<ShoppingList, "items">;

/** Total do item em centavos. Sem preço = 0. */
export function itemTotalCents(item: ShoppingItem): number {
  if (item.unitPriceCents === undefined) return 0;
  if (item.unit === "kg") return priceByWeight(item.unitPriceCents, item.quantity);
  return Math.round(item.quantity * item.unitPriceCents);
}

/** Soma dos itens marcados (RF-01). */
export function cartTotalCents(list: WithItems): number {
  return list.items.reduce((sum, i) => (i.checked ? sum + itemTotalCents(i) : sum), 0);
}

/** Soma de todos os itens com preço. */
export function estimatedTotalCents(list: WithItems): number {
  return list.items.reduce((sum, i) => sum + itemTotalCents(i), 0);
}

export function checkedCount(list: WithItems): number {
  return list.items.filter((i) => i.checked).length;
}

export function totalCount(list: WithItems): number {
  return list.items.length;
}
