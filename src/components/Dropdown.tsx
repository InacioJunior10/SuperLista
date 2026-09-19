import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, hitTarget, radius, sizes, spacing, typography } from "@/theme";

import { Icon } from "./Icon";

export type DropdownOption<T extends string> = { value: T; label: string };

export type DropdownProps<T extends string> = {
  /** Nome acessível do campo (ex.: "Tipo de quantidade"). */
  label: string;
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

/** Select sem dependências: gatilho com o valor atual + seta; a lista abre logo abaixo (inline). */
export function Dropdown<T extends string>({ label, value, options, onChange, style }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={style}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: current?.label }}
        accessibilityState={{ expanded: open }}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{current?.label}</Text>
        <Icon name={open ? "recolher" : "expandir"} size={sizes.iconLg} color={colors.slateMuted} />
      </Pressable>
      {open && (
        <View accessibilityRole="radiogroup" style={styles.list}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityLabel={o.label}
                accessibilityState={{ selected }}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: hitTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.base,
  },
  triggerText: { ...typography.bodyLg, color: colors.slate },
  list: {
    marginTop: spacing.xs,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  option: { minHeight: hitTarget, justifyContent: "center", paddingHorizontal: spacing.base },
  optionSelected: { backgroundColor: colors.brandSoft },
  optionText: { ...typography.bodyLg, color: colors.slate },
  optionTextSelected: { ...typography.labelLg, color: colors.brand },
});
