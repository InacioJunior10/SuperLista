import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SuperLista</Text>
      <Text style={styles.subtitle}>Suas listas de compras, em um só lugar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.base,
    backgroundColor: colors.canvas,
  },
  title: { ...typography.headlineLg, color: colors.brand },
  subtitle: { ...typography.bodyLg, marginTop: spacing.sm, color: colors.slate },
});
