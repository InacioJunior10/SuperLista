// Domínio conforme docs/stitch/PRD.md (RF-03, RF-04, RF-06). Dinheiro sempre em centavos.
export type Category =
  | "hortifruti"
  | "laticinios"
  | "padaria"
  | "carnes"
  | "limpeza"
  | "outros";

export type Unit = "kg" | "un";

export type ShoppingItem = {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  /** un: quantidade de unidades; kg: peso em gramas */
  quantity: number;
  /** Preço unitário (por un) ou por kg, em centavos. Padrão 0 (= "Definir preço" na UI); nunca ausente. */
  unitPriceCents: number;
  /** "Pego no carrinho": entra no total (RF-01) */
  checked: boolean;
};

export type ShoppingList = {
  id: string;
  title: string;
  market?: string;
  /** Meta de orçamento em centavos (RF-06) */
  budgetCents?: number;
  items: ShoppingItem[];
  createdAt: string;
};
