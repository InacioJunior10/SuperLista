import type { Category } from "../../types/list";

const KEYWORDS: Record<Exclude<Category, "outros">, string[]> = {
  hortifruti: ["tomate", "banana", "maca", "alface", "cebola", "batata", "cenoura", "laranja", "limao", "fruta", "verdura"],
  laticinios: ["leite", "queijo", "iogurte", "manteiga", "requeijao", "presunto", "creme de leite"],
  padaria: ["pao", "bolo", "biscoito", "torrada", "cafe", "bisnaga"],
  carnes: ["frango", "carne", "bife", "linguica", "peixe", "salsicha", "costela"],
  limpeza: ["detergente", "sabao", "shampoo", "sabonete", "desinfetante", "amaciante", "papel higienico"],
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Sugere a categoria por palavra-chave simples; `null` quando nada casa. */
export function suggestCategory(name: string): Category | null {
  const text = ` ${normalize(name)}`;
  if (text.trim() === "") return null;
  for (const [category, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => text.includes(` ${w}`))) return category as Category;
  }
  return null;
}
