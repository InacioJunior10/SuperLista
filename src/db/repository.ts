import type { Category, ShoppingItem, ShoppingList, Unit } from "@/types/list";
import { newId } from "@/utils/id";

import type { Db, SqlValue } from "./types";

type ListRow = {
  id: string;
  title: string;
  market: string | null;
  budget_cents: number | null;
  created_at: string;
};

type ItemRow = {
  id: string;
  list_id: string;
  name: string;
  category: Category;
  unit: Unit;
  quantity: number;
  unit_price_cents: number | null;
  checked: number;
  position: number;
};

export type NewList = { title: string; market?: string; budgetCents?: number };
export type ListPatch = { title?: string; market?: string | null; budgetCents?: number | null };

export type NewItem = {
  name: string;
  category?: Category;
  unit?: Unit;
  quantity?: number;
  unitPriceCents?: number;
  checked?: boolean;
};
/** `unitPriceCents: null` remove o preço ("Definir preço"). */
export type ItemPatch = Partial<Omit<NewItem, "unitPriceCents">> & { unitPriceCents?: number | null };

const toItem = (row: ItemRow): ShoppingItem => ({
  id: row.id,
  name: row.name,
  category: row.category,
  unit: row.unit,
  quantity: row.quantity,
  unitPriceCents: row.unit_price_cents ?? undefined,
  checked: row.checked === 1,
});

const toList = (row: ListRow, items: ShoppingItem[]): ShoppingList => ({
  id: row.id,
  title: row.title,
  market: row.market ?? undefined,
  budgetCents: row.budget_cents ?? undefined,
  items,
  createdAt: row.created_at,
});

/** UPDATE parcial: ignora campos `undefined`; `null` grava NULL. Nomes de tabela/coluna vêm do código, nunca do usuário. */
async function update(db: Db, table: "lists" | "items", id: string, fields: Record<string, SqlValue | undefined>) {
  const entries = Object.entries(fields).filter((entry): entry is [string, SqlValue] => entry[1] !== undefined);
  if (entries.length === 0) return;
  const sets = entries.map(([column]) => `${column} = ?`).join(", ");
  await db.runAsync(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
}

export function createListsRepository(db: Db) {
  async function getItems(listId: string): Promise<ShoppingItem[]> {
    const rows = await db.getAllAsync<ItemRow>(
      "SELECT * FROM items WHERE list_id = ? ORDER BY position, rowid",
      [listId],
    );
    return rows.map(toItem);
  }

  async function getList(id: string): Promise<ShoppingList | null> {
    const row = await db.getFirstAsync<ListRow>("SELECT * FROM lists WHERE id = ?", [id]);
    return row ? toList(row, await getItems(id)) : null;
  }

  async function getItem(id: string): Promise<ShoppingItem | null> {
    const row = await db.getFirstAsync<ItemRow>("SELECT * FROM items WHERE id = ?", [id]);
    return row ? toItem(row) : null;
  }

  return {
    /** Todas as listas (mais recentes primeiro) com seus itens, em 2 consultas. */
    async listLists(): Promise<ShoppingList[]> {
      const lists = await db.getAllAsync<ListRow>("SELECT * FROM lists ORDER BY created_at DESC, rowid DESC");
      const items = await db.getAllAsync<ItemRow>("SELECT * FROM items ORDER BY position, rowid");
      const byList = new Map<string, ShoppingItem[]>();
      for (const row of items) {
        const bucket = byList.get(row.list_id) ?? [];
        bucket.push(toItem(row));
        byList.set(row.list_id, bucket);
      }
      return lists.map((row) => toList(row, byList.get(row.id) ?? []));
    },

    getList,
    getItem,

    async createList(input: NewList): Promise<ShoppingList> {
      const id = newId();
      const createdAt = new Date().toISOString();
      await db.runAsync(
        "INSERT INTO lists (id, title, market, budget_cents, created_at) VALUES (?, ?, ?, ?, ?)",
        [id, input.title, input.market ?? null, input.budgetCents ?? null, createdAt],
      );
      return { id, title: input.title, market: input.market, budgetCents: input.budgetCents, items: [], createdAt };
    },

    async updateList(id: string, patch: ListPatch): Promise<ShoppingList | null> {
      await update(db, "lists", id, {
        title: patch.title,
        market: patch.market,
        budget_cents: patch.budgetCents,
      });
      return getList(id);
    },

    /** Apaga a lista e (via ON DELETE CASCADE) seus itens. */
    async deleteList(id: string): Promise<void> {
      await db.runAsync("DELETE FROM lists WHERE id = ?", [id]);
    },

    async addItem(listId: string, input: NewItem): Promise<ShoppingItem> {
      const id = newId();
      const last = await db.getFirstAsync<{ next: number }>(
        "SELECT COALESCE(MAX(position), -1) + 1 AS next FROM items WHERE list_id = ?",
        [listId],
      );
      const item: ShoppingItem = {
        id,
        name: input.name,
        category: input.category ?? "outros",
        unit: input.unit ?? "un",
        quantity: input.quantity ?? 1,
        unitPriceCents: input.unitPriceCents,
        checked: input.checked ?? false,
      };
      await db.runAsync(
        `INSERT INTO items (id, list_id, name, category, unit, quantity, unit_price_cents, checked, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          listId,
          item.name,
          item.category,
          item.unit,
          item.quantity,
          item.unitPriceCents ?? null,
          item.checked ? 1 : 0,
          last?.next ?? 0,
        ],
      );
      return item;
    },

    async updateItem(id: string, patch: ItemPatch): Promise<ShoppingItem | null> {
      await update(db, "items", id, {
        name: patch.name,
        category: patch.category,
        unit: patch.unit,
        quantity: patch.quantity,
        unit_price_cents: patch.unitPriceCents,
        checked: patch.checked === undefined ? undefined : patch.checked ? 1 : 0,
      });
      return getItem(id);
    },

    async removeItem(id: string): Promise<void> {
      await db.runAsync("DELETE FROM items WHERE id = ?", [id]);
    },
  };
}

export type ListsRepository = ReturnType<typeof createListsRepository>;
