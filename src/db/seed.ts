import type { ListsRepository, NewItem } from "./repository";
import type { Db } from "./types";

/** Incremente para forçar nova carga da lista inicial (substitui as listas existentes uma vez). */
export const INITIAL_LIST_REVISION = 1;
const REVISION_KEY = "initial_list_revision";

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

/** Cria a lista inicial se ainda não existir nenhuma lista. Retorna true se semeou. */
export async function seedIfEmpty(repo: ListsRepository): Promise<boolean> {
  if ((await repo.listLists()).length > 0) return false;
  await createInitialList(repo);
  return true;
}

/**
 * Sincroniza a lista inicial uma vez por revisão (app_meta.initial_list_revision): ao mudar a
 * revisão, substitui TODAS as listas pela lista inicial exata (purchases/products intactos).
 * Depois disso, edições do usuário são preservadas. Retorna true se sincronizou.
 */
export async function syncInitialList(db: Db, repo: ListsRepository): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = ?", [REVISION_KEY]);
  if (row?.value === String(INITIAL_LIST_REVISION)) return false;

  await db.withTransactionAsync(async () => {
    for (const list of await repo.listLists()) await repo.deleteList(list.id);
    await createInitialList(repo);
    await db.runAsync("INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)", [
      REVISION_KEY,
      String(INITIAL_LIST_REVISION),
    ]);
  });
  return true;
}
