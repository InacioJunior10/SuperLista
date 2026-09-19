import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components";
import { colors, radius, sizes, spacing, typography } from "@/theme";

const SKELETON_ROWS = 4;
const ROW_HEIGHT = sizes.iconLg * 2;

export function ListLoading() {
  return (
    <View testID="lista-carregando" accessibilityLabel="Carregando lista" style={styles.wrap}>
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <View key={i} style={styles.bar} />
      ))}
    </View>
  );
}

export type ListErrorProps = { onRetry: () => void };

export function ListError({ onRetry }: ListErrorProps) {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>
        Não foi possível carregar a lista
      </Text>
      <Text style={styles.body}>Ocorreu um erro ao ler seus dados. Tente novamente.</Text>
      <Button label="Tentar novamente" onPress={onRetry} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, paddingVertical: spacing.base },
  bar: { height: ROW_HEIGHT, borderRadius: radius.md, backgroundColor: colors.stroke },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  title: { ...typography.headlineSm, color: colors.slate, textAlign: "center" },
  body: { ...typography.bodyMd, color: colors.slateMuted, textAlign: "center" },
  button: { marginTop: spacing.md },
});
