import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { colors, hitTarget, radius, sizes, spacing, typography } from "@/theme";

export type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

// Pill visual de 36px (DESIGN.md); a área de toque é ampliada para 48 via hitSlop.
const CHIP_HEIGHT = sizes.chipHeight;
const HIT_SLOP = (hitTarget - CHIP_HEIGHT) / 2;

export function Chip({ label, active = false, onPress, accessibilityLabel, style }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      style={[styles.base, active ? styles.active : styles.inactive, style]}
    >
      <Text style={[styles.label, { color: active ? colors.onPrimary : colors.slateMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: CHIP_HEIGHT,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  active: { backgroundColor: colors.brand, borderColor: colors.brand },
  inactive: { backgroundColor: colors.card, borderColor: colors.stroke },
  label: { ...typography.labelLg },
});