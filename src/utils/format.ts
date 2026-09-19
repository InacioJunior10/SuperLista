import type { ShoppingItem } from "@/types/list";

import { formatBRL } from "./money";

const GRAMS_PER_KG = 1000;

/** 800 -> "0,800 kg"; 1500 -> "1,500 kg" (quantity de itens kg está em gramas). */
export function formatWeightKg(grams: number): string {
  return `${(grams / GRAMS_PER_KG).toFixed(3).replace(".", ",")} kg`;
}

/** 500 -> "500 g" (quantity de itens g está em gramas). */
export function formatWeightG(grams: number): string {
  return `${grams} g`;
}

/** Detalhe da linha: "0,800 kg × R$ 10,25/kg", "500 g × R$ 42,90/kg", "2 un × R$ 4,99", "2 pacotes × R$ 4,99"; sem preço, só a quantidade. */
export function formatItemDetail(
  item: Pick<ShoppingItem, "unit" | "quantity" | "unitPriceCents">,
): string {
  const hasPrice = item.unitPriceCents > 0;
  if (item.unit === "kg" || item.unit === "g") {
    const weight = item.unit === "g" ? formatWeightG(item.quantity) : formatWeightKg(item.quantity);
    return hasPrice ? `${weight} × ${formatBRL(item.unitPriceCents)}/kg` : weight;
  }
  const qty = item.unit === "pct" ? `${item.quantity} ${item.quantity === 1 ? "pacote" : "pacotes"}` : `${item.quantity} un`;
  return hasPrice ? `${qty} × ${formatBRL(item.unitPriceCents)}` : qty;
}

/** Subtítulo do header: "Pão de Açúcar • Hoje" ou só "Hoje". */
export function formatListSubtitle(market?: string): string {
  const name = market?.trim();
  return name ? `${name} • Hoje` : "Hoje";
}
