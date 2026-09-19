// Valores monetários são guardados em CENTAVOS (inteiros) para evitar erros de ponto flutuante.
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 16886 -> "R$ 168,86" */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100).replace(/ /g, " ");
}

/** Digitação com máscara: "820" -> 820 (centavos). Ignora tudo que não for dígito. */
export function parseCents(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Preço por kg (centavos) x peso em gramas -> total em centavos. 800 g x 1025 = 820 */
export function priceByWeight(pricePerKgCents: number, grams: number): number {
  return Math.round((pricePerKgCents * grams) / 1000);
}
