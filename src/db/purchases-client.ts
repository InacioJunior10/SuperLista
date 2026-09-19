import { getDb } from "./client";
import { createPurchasesRepository, type PurchasesRepository } from "./purchases";

let pending: Promise<PurchasesRepository> | null = null;

/** Repositório de compras sobre a conexão compartilhada. */
export function getPurchasesRepository(): Promise<PurchasesRepository> {
  pending ??= getDb()
    .then(createPurchasesRepository)
    .catch((error) => {
      pending = null;
      throw error;
    });
  return pending;
}
