import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

export function ListTip() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Dica da SuperLista</Text>
      <Text style={styles.body}>
        Toque em qualquer item para informar o preço na gôndola e manter o total sempre atualizado.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    gap: spacing.xs,
  },
  title: { ...typography.labelLg, color: colors.primary },
  body: { ...typography.bodyMd, color: colors.slate },
});
