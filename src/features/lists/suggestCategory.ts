import type { Category } from "../../types/list";

// Ordem importa (o primeiro casamento vence): mercearia vem antes para "macarrão" não cair em "maçã".
// Palavra com "=" só casa como palavra inteira (ex.: "sal" não deve casar "salsicha").
const KEYWORDS: Record<Exclude<Category, "outros">, string[]> = {
  mercearia: [
    "arroz", "cafe", "feijao", "farinha", "=sal", "fermento", "oleo", "fuba", "molho", "oregano",
    "macarrao", "nescau", "suco", "acucar",
  ],
  hortifruti: ["tomate", "banana", "maca", "alface", "cebola", "batata", "cenoura", "laranja", "limao", "fruta", "verdura"],
  laticinios: ["leite", "queijo", "iogurte", "manteiga", "requeijao", "presunto", "creme de leite"],
  padaria: ["pao", "bolo", "biscoito", "torrada", "bisnaga"],
  carnes: ["frango", "carne", "bife", "linguica", "peixe", "salsicha", "costela"],
  limpeza: [
    "detergente", "sabao", "shampoo", "condicionador", "sabonete", "desodorante", "desinfetante",
    "amaciante", "papel higienico", "creme dental",
  ],
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
    if (words.some((w) => (w.startsWith("=") ? text.split(" ").includes(w.slice(1)) : text.includes(` ${w}`)))) return category as Category;
  }
  return null;
}
