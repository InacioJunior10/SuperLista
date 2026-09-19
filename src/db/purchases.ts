import type { Category, Unit } from "@/types/list";
import { newId } from "@/utils/id";

import type { Db } from "./types";

export type PaymentMethod = "dinheiro" | "debito" | "credito" | "vale";

export type PurchaseItem = {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
};

export type PurchaseSummary = {
  id: string;
  title: string;
  market?: string;
  budgetCents?: number;
  totalCents: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

export type Purchase = PurchaseSummary & { items: PurchaseItem[] };

export type NewPurchase = {
  title: string;
  market?: string;
  budgetCents?: number;
  paymentMethod: PaymentMethod;
  items: Omit<PurchaseItem, "id">[];
};

export type PriceHistoryPoint = { createdAt: string; unit: Unit; unitPriceCents: number };

type PurchaseRow = {
  id: string;
  title: string;
  market: string | null;
  budget_cents: number | null;
  total_cents: number;
  item_count: number;
  payment_method: PaymentMethod;
  created_at: string;
};

type ItemRow = {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
};

const toSummary = (r: PurchaseRow): PurchaseSummary => ({
  id: r.id,
  title: r.title,
  market: r.market ?? undefined,
  budgetCents: r.budget_cents ?? undefined,
  totalCents: r.total_cents,
  itemCount: r.item_count,
  paymentMethod: r.payment_method,
  createdAt: r.created_at,
});

const toItem = (r: ItemRow): PurchaseItem => ({
  id: r.id,
  name: r.name,
  category: r.category,
  unit: r.unit,
  quantity: r.quantity,
  unitPriceCents: r.unit_price_cents,
  totalCents: r.total_cents,
});

export function createPurchasesRepository(db: Db) {
  return {
    async create(input: NewPurchase): Promise<Purchase> {
      const id = newId();
      const createdAt = new Date().toISOString();
      const items: PurchaseItem[] = input.items.map((i) => ({ ...i, id: newId() }));
      const totalCents = items.reduce((s, i) => s + i.totalCents, 0);
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO purchases (id, title, market, budget_cents, total_cents, item_count, payment_method, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.title,
            input.market ?? null,
            input.budgetCents ?? null,
            totalCents,
            items.length,
            input.paymentMethod,
            createdAt,
          ],
        );
        for (const i of items) {
          await db.runAsync(
            `INSERT INTO purchase_items (id, purchase_id, name, category, unit, quantity, unit_price_cents, total_cents)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [i.id, id, i.name, i.category, i.unit, i.quantity, i.unitPriceCents, i.totalCents],
          );
        }
      });
      return {
        id,
        title: input.title,
        market: input.market,
        budgetCents: input.budgetCents,
        totalCents,
        itemCount: items.length,
        paymentMethod: input.paymentMethod,
        createdAt,
        items,
      };
    },

    async listPurchases(): Promise<PurchaseSummary[]> {
      const rows = await db.getAllAsync<PurchaseRow>(
        "SELECT * FROM purchases ORDER BY created_at DESC, rowid DESC",
      );
      return rows.map(toSummary);
    },

    async getPurchase(id: string): Promise<Purchase | null> {
      const row = await db.getFirstAsync<PurchaseRow>("SELECT * FROM purchases WHERE id = ?", [id]);
      if (!row) return null;
      const items = await db.getAllAsync<ItemRow>(
        "SELECT * FROM purchase_items WHERE purchase_id = ? ORDER BY rowid",
        [id],
      );
      return { ...toSummary(row), items: items.map(toItem) };
    },

    async priceHistory(productName: string): Promise<PriceHistoryPoint[]> {
      const rows = await db.getAllAsync<{ created_at: string; unit: Unit; unit_price_cents: number }>(
        `SELECT p.created_at, i.unit, i.unit_price_cents
           FROM purchase_items i JOIN purchases p ON p.id = i.purchase_id
          WHERE LOWER(i.name) = LOWER(?)
          ORDER BY p.created_at ASC, i.rowid ASC`,
        [productName],
      );
      return rows.map((r) => ({ createdAt: r.created_at, unit: r.unit, unitPriceCents: r.unit_price_cents }));
    },

    async productNames(): Promise<string[]> {
      const rows = await db.getAllAsync<{ name: string }>(
        "SELECT DISTINCT name FROM purchase_items ORDER BY name COLLATE NOCASE",
      );
      return rows.map((r) => r.name);
    },
  };
}

export type PurchasesRepository = ReturnType<typeof createPurchasesRepository>;
