import type { Category } from "../../types/list";

export type CategoryInfo = {
  key: Category;
  label: string;
  /** Rótulo curto para chips de filtro. */
  chipLabel: string;
  /** Nome do ícone (MaterialCommunityIcons). */
  icon: string;
};

/** Ordem do PRD; "outros" sempre por último. */
export const CATEGORIES: readonly CategoryInfo[] = [
  { key: "hortifruti", label: "Hortifrúti & Feira", chipLabel: "Hortifrúti", icon: "food-apple-outline" },
  { key: "laticinios", label: "Laticínios & Frios", chipLabel: "Laticínios", icon: "cheese" },
  { key: "padaria", label: "Padaria & Matinais", chipLabel: "Padaria", icon: "bread-slice-outline" },
  { key: "carnes", label: "Carnes & Aves", chipLabel: "Carnes", icon: "food-drumstick-outline" },
  { key: "limpeza", label: "Limpeza & Higiene", chipLabel: "Limpeza", icon: "spray-bottle" },
  { key: "outros", label: "Outros", chipLabel: "Outros", icon: "dots-horizontal" },
];

export function getCategoryInfo(key: Category): CategoryInfo {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}
