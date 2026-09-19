import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components";
import { colors, spacing, typography } from "@/theme";

export type EmptyStateProps = { onAddItem: () => void };

export function EmptyState({ onAddItem }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>
        Sua lista está vazia
      </Text>
      <Text style={styles.body}>Adicione os itens que você precisa comprar.</Text>
      <Button label="Adicionar primeiro item" onPress={onAddItem} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  title: { ...typography.headlineSm, color: colors.slate },
  body: { ...typography.bodyMd, color: colors.slateMuted, textAlign: "center" },
  button: { marginTop: spacing.md },
});
