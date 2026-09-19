import type { TextStyle } from "react-native";

// Plus Jakarta Sans via @expo-google-fonts/plus-jakarta-sans (carregada em app/_layout.tsx).
// Em RN o peso vem da família, não de fontWeight.
export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export const typography = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 36, lineHeight: 44 },
  headlineLg: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 36 },
  headlineLgMobile: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 32 },
  headlineMd: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 28 },
  headlineSm: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24 },
  bodyLg: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  labelLg: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 20 },
  labelMd: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16 },
  labelSm: { fontFamily: fontFamily.bold, fontSize: 10, lineHeight: 12 },
  // Valores em R$: sempre algarismos tabulares
  currencyDisplay: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    lineHeight: 32,
    fontVariant: ["tabular-nums"],
  },
} as const satisfies Record<string, TextStyle>;
