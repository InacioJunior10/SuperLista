import type { ShoppingItem } from "@/types/list";

import { formatBRL } from "./money";

const GRAMS_PER_KG = 1000;

/** 800 -> "0,800 kg"; 1500 -> "1,500 kg" (quantity de itens kg está em gramas). */
export function formatWeightKg(grams: number): string {
  return `${(grams / GRAMS_PER_KG).toFixed(3).replace(".", ",")} kg`;
}

/** Detalhe da linha: "0,800 kg × R$ 10,25/kg", "2 un × R$ 4,99"; sem preço, só a quantidade. */
export function formatItemDetail(
  item: Pick<ShoppingItem, "unit" | "quantity" | "unitPriceCents">,
): string {
  const hasPrice = item.unitPriceCents > 0;
  if (item.unit === "kg") {
    const weight = formatWeightKg(item.quantity);
    return hasPrice ? `${weight} × ${formatBRL(item.unitPriceCents)}/kg` : weight;
  }
  const qty = `${item.quantity} un`;
  return hasPrice ? `${qty} × ${formatBRL(item.unitPriceCents)}` : qty;
}

/** Subtítulo do header: "Pão de Açúcar • Hoje" ou só "Hoje". */
export function formatListSubtitle(market?: string): string {
  const name = market?.trim();
  return name ? `${name} • Hoje` : "Hoje";
}
