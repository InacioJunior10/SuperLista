// Domínio conforme docs/stitch/PRD.md (RF-03, RF-04, RF-06). Dinheiro sempre em centavos.
export type Category =
  | "hortifruti"
  | "laticinios"
  | "padaria"
  | "carnes"
  | "mercearia"
  | "limpeza"
  | "outros";

/** kg e g guardam gramas em `quantity` e preço POR KG; g apenas exibe a quantidade em gramas. */
export type Unit = "kg" | "un" | "g";

export type ShoppingItem = {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  /** un: quantidade de unidades; kg e g: peso em gramas */
  quantity: number;
  /** Preço unitário (por un) ou por kg (kg e g), em centavos. Padrão 0 (= "Definir preço" na UI); nunca ausente. */
  unitPriceCents: number;
  /** "Pego no carrinho": só os itens marcados entram no total do topo e na comparação com a meta */
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
