import type { NewItem, ListsRepository } from "./repository";

// Dados de exemplo baseados na tela do Stitch (docs/stitch/screens/lista-de-compras.png).
// kg: quantity em gramas; preços em centavos.
const SAMPLE_ITEMS: readonly NewItem[] = [
  { name: "Maçã Fuji", category: "hortifruti", unit: "kg", quantity: 1000, unitPriceCents: 1290, checked: true },
  { name: "Banana Prata", category: "hortifruti", unit: "kg", quantity: 1000, unitPriceCents: 649, checked: true },
  { name: "Tomate Italiano", category: "hortifruti", unit: "kg", quantity: 800, unitPriceCents: 1025 },
  { name: "Queijo Muçarela Fatiado", category: "laticinios", unit: "un", quantity: 1, unitPriceCents: 1490, checked: true },
  { name: "Leite Integral Tipo A", category: "laticinios", unit: "un", quantity: 6, unitPriceCents: 499 },
  { name: "Iogurte Natural Integral", category: "laticinios", unit: "un", quantity: 2 },
  { name: "Pão Francês Quentinho", category: "padaria", unit: "kg", quantity: 500, unitPriceCents: 1590, checked: true },
  { name: "Café Torrado e Moído", category: "padaria", unit: "un", quantity: 1, unitPriceCents: 2290 },
  { name: "Filé de Peito de Frango", category: "carnes", unit: "kg", quantity: 1000, unitPriceCents: 2290 },
  { name: "Carne Moída Patinho", category: "carnes", unit: "kg", quantity: 500, unitPriceCents: 4290 },
  { name: "Detergente Neutro", category: "limpeza", unit: "un", quantity: 3, unitPriceCents: 249, checked: true },
  { name: "Sabão Líquido Concentrado", category: "limpeza", unit: "un", quantity: 1, unitPriceCents: 2990 },
];

/** Cria a lista de exemplo se ainda não existir nenhuma lista. Retorna true se semeou. */
export async function seedIfEmpty(repo: ListsRepository): Promise<boolean> {
  if ((await repo.listLists()).length > 0) return false;

  const list = await repo.createList({
    title: "Compras do mês",
    market: "Pão de Açúcar",
    budgetCents: 20000,
  });
  for (const item of SAMPLE_ITEMS) {
    await repo.addItem(list.id, item);
  }
  return true;
}
