import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { colors, typography } from "@/theme";
import { formatBRL } from "@/utils/money";

export type MoneyTextProps = {
  /** Valor em centavos. */
  cents: number;
  style?: StyleProp<TextStyle>;
};

export function MoneyText({ cents, style }: MoneyTextProps) {
  return <Text style={[styles.text, style]}>{formatBRL(cents)}</Text>;
}

const styles = StyleSheet.create({
  text: { ...typography.currencyDisplay, color: colors.slate },
});