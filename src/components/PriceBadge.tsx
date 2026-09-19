import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { colors, hitTarget, radius, spacing, typography } from "@/theme";
import { formatBRL } from "@/utils/money";

import { Icon } from "./Icon";

export type PriceBadgeProps = {
  /** Preço em centavos; ausente/null = "Definir preço". */
  cents?: number | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const ICON_SIZE = 16;

export function PriceBadge({ cents, onPress, style }: PriceBadgeProps) {
  const hasPrice = cents !== null && cents !== undefined;
  const text = hasPrice ? formatBRL(cents) : "Definir preço";
  const tint = hasPrice ? colors.slate : colors.amber;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasPrice ? `Editar preço, ${text}` : "Definir preço"}
      style={[styles.base, hasPrice ? styles.set : styles.unset, style]}
    >
      <Text style={[styles.text, { color: tint }]}>{text}</Text>
      <Icon name="editar" size={ICON_SIZE} color={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: hitTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.base,
    borderWidth: 1,
  },
  set: { backgroundColor: colors.canvas, borderColor: colors.stroke },
  unset: { backgroundColor: colors.card, borderColor: colors.amber },
  text: { ...typography.labelLg, fontVariant: ["tabular-nums"] },
});