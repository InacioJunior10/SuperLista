import type { Product } from "@/db/products";

// require tardio: o banco nativo só é carregado quando há leitura de código (testes de tela não o exigem).
const repo = async () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require("@/db/products-client") as typeof import("@/db/products-client")).getProductsRepository();

/** Consulta o catálogo local; null se o EAN ainda não foi cadastrado (ou se o banco falhar). */
export async function lookupProduct(ean: string): Promise<Product | null> {
  try {
    return await (await repo()).getByEan(ean);
  } catch {
    return null;
  }
}

/** Guarda/atualiza o produto no catálogo local para as próximas leituras. */
export async function rememberProduct(product: Product): Promise<void> {
  try {
    await (await repo()).upsert(product);
  } catch {
    // catálogo é auxiliar: falha não bloqueia adicionar o item
  }
}
