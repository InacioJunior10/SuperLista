import type { ViewStyle } from "react-native";

import { colors } from "./colors";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16, // gutter e margin
  lg: 20,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  base: 8, // inputs, pills de ação, badges
  md: 12,
  lg: 16, // cards, modais, blocos flutuantes
  xl: 24, // botões sticky, hero
  full: 9999, // steppers, chips
} as const;

// Alvo de toque mínimo (PRD NFR: 44x44; design system: 48)
export const hitTarget = 48;
// Folga inferior para a barra de totais / navegação fixa
export const bottomClearance = 80;

// Medidas de componentes do DESIGN.md (Components).
export const sizes = {
  /** Altura base da barra de abas (sem a inset inferior do sistema). */
  tabBar: hitTarget + spacing.sm,
  chipHeight: 36,
  checkbox: 24,
  checkIcon: 16,
  progressBar: 8,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
} as const;

/** Escala ao pressionar botões primários (feedback tátil). */
export const pressedScale = 0.98;
export const disabledOpacity = 0.5;

export const elevation = {
  level0: {},
  level1: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.stroke,
    shadowColor: colors.slate,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  level2: {
    shadowColor: colors.slate,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  totalizer: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;
