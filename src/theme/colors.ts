// Tokens do design system "Fresh Market Grotesk" — fonte: docs/stitch/DESIGN.md
export const colors = {
  // Material 3 roles
  surface: "#f9f9ff",
  surfaceDim: "#cfdaf2",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f0f3ff",
  surfaceContainer: "#e7eeff",
  surfaceContainerHigh: "#dee8ff",
  surfaceContainerHighest: "#d8e3fb",
  onSurface: "#111c2d",
  onSurfaceVariant: "#3d4a41",
  inverseSurface: "#263143",
  inverseOnSurface: "#ecf1ff",
  outline: "#6d7a70",
  outlineVariant: "#bccabe",
  primary: "#006d43",
  onPrimary: "#ffffff",
  primaryContainer: "#00a86b",
  onPrimaryContainer: "#00331d",
  inversePrimary: "#59de9b",
  secondary: "#7c5800",
  onSecondary: "#ffffff",
  secondaryContainer: "#feb700",
  onSecondaryContainer: "#6b4b00",
  tertiary: "#006c49",
  tertiaryContainer: "#00a773",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  background: "#f9f9ff",
  onBackground: "#111c2d",

  // Marca / uso em componentes (ver "Colors" e "Components" em DESIGN.md)
  brand: "#00A86B", // botão primário, chips ativos, checkbox marcado
  brandSoft: "#E8F5E9", // botão secundário
  gold: "#FFB800",
  mint: "#10B981",
  slate: "#1E293B", // texto principal / números
  slateMuted: "#475569",
  canvas: "#F8FAFC",
  card: "#FFFFFF",
  stroke: "#E2E8F0",
  strokeStrong: "#CBD5E1",
  danger: "#EF4444",
  amber: "#F59E0B",
} as const;

export type ColorToken = keyof typeof colors;
