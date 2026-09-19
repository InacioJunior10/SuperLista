import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, hitTarget, radius, sizes, spacing, typography } from "@/theme";

import { Icon } from "./Icon";

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  unit?: "un" | "kg";
  min?: number;
  max?: number;
  /** Incremento por toque. Padrão 1. */
  step?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const ICON_SIZE = sizes.iconMd;

export function Stepper({
  value,
  onChange,
  unit = "un",
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  accessibilityLabel = "Quantidade",
  style,
}: StepperProps) {
  const canDec = value - step >= min;
  const canInc = value + step <= max;
  return (
    <View style={[styles.pill, style]}>
      <Pressable
        onPress={() => canDec && onChange(value - step)}
        disabled={!canDec}
        accessibilityRole="button"
        accessibilityLabel={`Diminuir ${accessibilityLabel.toLowerCase()}`}
        accessibilityState={{ disabled: !canDec }}
        style={styles.btn}
      >
        <Icon name="remover" size={ICON_SIZE} color={canDec ? colors.brand : colors.strokeStrong} />
      </Pressable>
      <Text
        accessibilityRole="adjustable"
        accessibilityLabel={`${accessibilityLabel}: ${value} ${unit}`}
        style={styles.value}
      >
        {`${value} ${unit}`}
      </Text>
      <Pressable
        onPress={() => canInc && onChange(value + step)}
        disabled={!canInc}
        accessibilityRole="button"
        accessibilityLabel={`Aumentar ${accessibilityLabel.toLowerCase()}`}
        accessibilityState={{ disabled: !canInc }}
        style={styles.btn}
      >
        <Icon name="adicionar" size={ICON_SIZE} color={canInc ? colors.brand : colors.strokeStrong} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.card,
  },
  btn: { width: hitTarget, height: hitTarget, alignItems: "center", justifyContent: "center" },
  value: {
    ...typography.labelLg,
    color: colors.slate,
    minWidth: hitTarget,
    paddingHorizontal: spacing.xs,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});