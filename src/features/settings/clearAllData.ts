import type { ListsRepository } from "@/db/repository";

/** Apaga todas as listas (e, por cascata, os itens). */
export async function clearAllData(repo: Pick<ListsRepository, "listLists" | "deleteList">) {
  const lists = await repo.listLists();
  for (const list of lists) await repo.deleteList(list.id);
}
