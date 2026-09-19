import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

import { colors } from "@/theme";

type GlyphName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export const iconMap = {
  lista: "format-list-bulleted",
  historico: "history",
  carrinho: "cart-outline",
  ajustes: "cog-outline",
  hortifruti: "carrot",
  laticinios: "cheese",
  padaria: "bread-slice-outline",
  carnes: "food-steak",
  limpeza: "spray-bottle",
  outros: "dots-horizontal",
  editar: "pencil-outline",
  fechar: "close",
  check: "check",
  adicionar: "plus",
  remover: "minus",
  recalcular: "calculator-variant-outline",
} as const satisfies Record<string, GlyphName>;

export type IconName = keyof typeof iconMap;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

const DEFAULT_SIZE = 24;

export function Icon({ name, size = DEFAULT_SIZE, color = colors.slate }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={iconMap[name]}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}