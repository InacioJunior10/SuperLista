import { getDb } from "./client";
import { createProductsRepository, type ProductsRepository } from "./products";

let pending: Promise<ProductsRepository> | null = null;

export function getProductsRepository(): Promise<ProductsRepository> {
  pending ??= getDb()
    .then(createProductsRepository)
    .catch((error) => {
      pending = null;
      throw error;
    });
  return pending;
}
