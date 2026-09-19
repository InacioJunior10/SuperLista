import type { Unit } from "@/types/list";

import type { Db } from "./types";

export type Product = {
  ean: string;
  name: string;
  category: string;
  unit: Unit;
};

export type ProductsRepository = {
  getByEan(ean: string): Promise<Product | null>;
  upsert(product: Product): Promise<Product>;
};

export function createProductsRepository(db: Db): ProductsRepository {
  const getByEan = (ean: string) =>
    db.getFirstAsync<Product>("SELECT ean, name, category, unit FROM products WHERE ean = ?", [ean]);

  return {
    getByEan,
    async upsert(product) {
      await db.runAsync(
        `INSERT INTO products (ean, name, category, unit, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(ean) DO UPDATE SET name = excluded.name, category = excluded.category,
           unit = excluded.unit, updated_at = excluded.updated_at`,
        [product.ean, product.name, product.category, product.unit, new Date().toISOString()],
      );
      return (await getByEan(product.ean)) as Product;
    },
  };
}
