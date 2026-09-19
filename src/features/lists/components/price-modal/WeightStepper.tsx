import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components";
import { colors, hitTarget, radius, sizes, spacing, typography } from "@/theme";
import type { Unit } from "@/types/list";
import { formatKgShort, STEP_GRAMS } from "@/utils/weight";

export type WeightStepperProps = {
  unit: Unit;
  /** un e pct: contagem; kg e g: gramas. */
  value: number;
  onChange: (value: number) => void;
};

/** Stepper do modal: un e pct de 1 em 1 (mín. 1); kg e g de 50 g em 50 g (mín. 50 g), exibindo em kg ou em g. */
export function WeightStepper({ unit, value, onChange }: WeightStepperProps) {
  const step = unit === "un" || unit === "pct" ? 1 : STEP_GRAMS;
  const canDec = value - step >= step;
  const text = unit === "kg" ? formatKgShort(value) : unit === "g" ? `${value} g` : unit === "pct" ? `${value} pct` : `${value} un`;
  return (
    <View style={styles.pill}>
      <Pressable
        onPress={() => canDec && onChange(value - step)}
        disabled={!canDec}
        accessibilityRole="button"
        accessibilityLabel="Diminuir quantidade"
        accessibilityState={{ disabled: !canDec }}
        style={styles.btn}
      >
        <Icon
          name="remover"
          size={sizes.iconMd}
          color={canDec ? colors.brand : colors.strokeStrong}
        />
      </Pressable>
      <Text accessibilityLabel={`Quantidade: ${text}`} style={styles.value}>
        {text}
      </Text>
      <Pressable
        onPress={() => onChange(value + step)}
        accessibilityRole="button"
        accessibilityLabel="Aumentar quantidade"
        style={styles.btn}
      >
        <Icon name="adicionar" size={sizes.iconMd} color={colors.brand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
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
