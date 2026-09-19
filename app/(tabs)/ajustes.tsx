import Constants from "expo-constants";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

import { Card, ScreenContainer } from "@/components";
import { useShoppingList } from "@/features/lists/ListsProvider";
import { clearAllData } from "@/features/settings/clearAllData";
import { colors, hitTarget, radius, spacing, typography } from "@/theme";

export default function AjustesScreen() {
  const { reload } = useShoppingList();

  const confirmClear = () => {
    Alert.alert("Apagar todos os dados?", "Esta ação não pode ser desfeita. A lista inicial será recriada.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          // require lazy: evita carregar expo-sqlite até a ação (import() não roda no Jest)
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { getListsRepository } = require("@/db/client") as typeof import("@/db/client");
          await clearAllData(await getListsRepository());
          await reload();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text accessibilityRole="header" style={styles.title}>
        Ajustes
      </Text>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sobre o app</Text>
        <Text style={styles.body}>SuperLista</Text>
        <Text style={styles.body}>Versão {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        <Text style={styles.body}>Seus dados ficam apenas neste dispositivo.</Text>
      </Card>
      <Card style={styles.card}>
        <Pressable
          onPress={confirmClear}
          accessibilityRole="button"
          accessibilityLabel="Limpar todos os dados"
          style={styles.danger}
        >
          <Text style={styles.dangerLabel}>Limpar todos os dados</Text>
        </Pressable>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineMd, color: colors.onSurface, marginVertical: spacing.base },
  card: { backgroundColor: colors.surfaceContainerLowest, marginBottom: spacing.base },
  cardTitle: { ...typography.labelLg, color: colors.onSurface, marginBottom: spacing.sm },
  body: { ...typography.bodyMd, color: colors.slateMuted },
  danger: {
    minHeight: hitTarget,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerLabel: { ...typography.labelLg, color: colors.danger },
});


