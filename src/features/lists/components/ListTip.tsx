import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components";
import { categoryColors, colors, radius, sizes, spacing, typography } from "@/theme";

const BADGE = sizes.iconLg + spacing.base;

export function ListTip() {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Icon name="dica" size={sizes.iconMd} color={categoryColors.hortifruti.fg} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>Dica da SuperLista</Text>
        <Text style={styles.body}>
          Toque em qualquer valor para informar o preço do produto na gôndola e ter a soma real no
          caixa.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: radius.full,
    backgroundColor: categoryColors.hortifruti.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1 },
  title: { ...typography.labelLg, color: colors.onSurface },
  body: { ...typography.bodySm, color: colors.onSurfaceVariant },
});
