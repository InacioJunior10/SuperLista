import type { ListsRepository, NewItem } from "./repository";

// Lista inicial do primeiro uso (banco vazio): preços zerados e nada marcado; o usuário edita.
// kg e g: quantity em gramas (1 kg = 1000). Itens g/kg sem peso explícito usam 100 g como padrão editável.
const INITIAL_ITEMS: readonly NewItem[] = [
  { name: "Arroz", quantity: 1000, unit: "kg", category: "mercearia" },
  { name: "Feijão", quantity: 3000, unit: "kg", category: "mercearia" },
  { name: "Farinha de trigo sem fermento", quantity: 1000, unit: "kg", category: "mercearia" },
  { name: "Sal", quantity: 1000, unit: "kg", category: "mercearia" },
  { name: "Fermento para bolo", quantity: 1, unit: "un", category: "mercearia" },
  { name: "Óleo de soja", quantity: 1, unit: "un", category: "mercearia" },
  { name: "Fubá", quantity: 1000, unit: "kg", category: "mercearia" },
  { name: "Sachês de molho de tomate Predileta", quantity: 4, unit: "un", category: "mercearia" },
  { name: "Orégano", quantity: 1, unit: "un", category: "mercearia" },
  { name: "Carne moída (acém ou músculo)", quantity: 1000, unit: "kg", category: "carnes" },
  { name: "Muçarela fatiada", quantity: 500, unit: "g", category: "laticinios" },
  { name: "Presunto", quantity: 400, unit: "g", category: "laticinios" },
  { name: "Linguiça calabresa grossa", quantity: 100, unit: "g", category: "carnes" },
  { name: "Peitos de frango", quantity: 5000, unit: "kg", category: "carnes" },
  { name: "Coxinha da asa", quantity: 4000, unit: "kg", category: "carnes" },
  { name: "Sobrecoxa", quantity: 4000, unit: "kg", category: "carnes" },
  { name: "Coxa grande", quantity: 4000, unit: "kg", category: "carnes" },
  { name: "Fígado de boi", quantity: 400, unit: "g", category: "carnes" },
  { name: "Sachê de requeijão forneável do grande", quantity: 100, unit: "g", category: "laticinios" },
  { name: "Margarina", quantity: 100, unit: "g", category: "laticinios" },
  { name: "Pão", quantity: 1, unit: "un", category: "padaria" },
  { name: "Caixas de leite", quantity: 3, unit: "un", category: "laticinios" },
  { name: "Frutas da promoção", quantity: 1000, unit: "kg", category: "hortifruti" },
  { name: "Legumes da promoção", quantity: 100, unit: "g", category: "hortifruti" },
  { name: "Cebolas brancas", quantity: 4, unit: "un", category: "hortifruti" },
  { name: "Cabeças de alho", quantity: 4, unit: "un", category: "hortifruti" },
  { name: "Pacotes de macarrão", quantity: 2, unit: "un", category: "mercearia" },
  { name: "Nescau", quantity: 1, unit: "un", category: "mercearia" },
  { name: "Café", quantity: 100, unit: "g", category: "mercearia" },
  { name: "Sabonete", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Sabonete para mim", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Desodorante para você", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Shampoo", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Condicionador", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Desinfetante", quantity: 2, unit: "un", category: "limpeza" },
  { name: "Limpa pedra", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Sabão em pó", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Detergente", quantity: 6, unit: "un", category: "limpeza" },
  { name: "Água sanitária", quantity: 1, unit: "un", category: "limpeza" },
  { name: "Patês Jade", quantity: 6, unit: "un", category: "outros" },
  { name: "Caixas grandes de suco (2 laranja, 2 abacaxi, uva, manga)", quantity: 6, unit: "un", category: "mercearia" },
];

async function createInitialList(repo: ListsRepository): Promise<void> {
  const list = await repo.createList({ title: "Lista de compras" });
  for (const item of INITIAL_ITEMS) {
    await repo.addItem(list.id, { ...item, unitPriceCents: 0, checked: false });
  }
}

let pending: Promise<boolean> | null = null;

/**
 * Se já existe QUALQUER lista, não faz nada (retorna false). Se não existe nenhuma, cria a lista
 * inicial (retorna true). Single-flight: chamadas simultâneas compartilham a mesma criação.
 */
export function ensureInitialList(repo: ListsRepository): Promise<boolean> {
  pending ??= (async () => {
    if ((await repo.listLists()).length > 0) return false;
    await createInitialList(repo);
    return true;
  })().finally(() => {
    pending = null;
  });
  return pending;
}