import { priceByWeight } from "../../utils/money";
import type { ShoppingItem, ShoppingList } from "../../types/list";

type WithItems = Pick<ShoppingList, "items">;

/** Total do item em centavos. Preço padrão 0 => total 0. */
export function itemTotalCents(item: ShoppingItem): number {
  if (item.unit === "kg" || item.unit === "g") return priceByWeight(item.unitPriceCents, item.quantity);
  return Math.round(item.quantity * item.unitPriceCents);
}

/** Soma dos itens marcados "Pego": é o total exibido no topo e comparado com a meta. */
export function cartTotalCents(list: WithItems): number {
  return list.items.reduce((sum, i) => (i.checked ? sum + itemTotalCents(i) : sum), 0);
}

/** Soma de TODOS os itens da lista (marcados ou não). */
export function estimatedTotalCents(list: WithItems): number {
  return list.items.reduce((sum, i) => sum + itemTotalCents(i), 0);
}

export function checkedCount(list: WithItems): number {
  return list.items.filter((i) => i.checked).length;
}

export function totalCount(list: WithItems): number {
  return list.items.length;
}
