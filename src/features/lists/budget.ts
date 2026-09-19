import { cartTotalCents } from "./totals";
import type { ShoppingList } from "../../types/list";

export type BudgetLevel = "none" | "ok" | "warning" | "over";

export type BudgetStatus = {
  /** Percentual (inteiro arredondado) do total pego sobre a meta; 0 sem meta. */
  percent: number;
  /** Meta menos total pego (negativo se estourou); 0 sem meta. */
  remainingCents: number;
  level: BudgetLevel;
};

/** warning a partir de 80% da meta; over acima de 100%; none sem meta. */
export function budgetStatus(list: Pick<ShoppingList, "items" | "budgetCents">): BudgetStatus {
  const budget = list.budgetCents;
  if (!budget || budget <= 0) return { percent: 0, remainingCents: 0, level: "none" };
  const total = cartTotalCents(list);
  const percent = Math.round((total * 100) / budget);
  // Comparações em inteiros, sem depender do percentual arredondado.
  const level: BudgetLevel = total * 100 > budget * 100 ? "over" : total * 5 >= budget * 4 ? "warning" : "ok";
  return { percent, remainingCents: budget - total, level };
}
