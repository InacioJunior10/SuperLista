import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components";
import { colors, radius, sizes, spacing, typography } from "@/theme";
import { formatListSubtitle } from "@/utils/format";

export type ListHeaderProps = { title: string; market?: string; onPress?: () => void };

const LOGO = sizes.iconLg + spacing.sm;

export function ListHeader({ title, market, onPress }: ListHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Editar lista ${title}`}
        style={styles.pressable}
      >
        <View style={styles.logo}>
          <Icon name="carrinho" size={sizes.iconMd} color={colors.onPrimary} />
        </View>
        <View style={styles.texts}>
          <View style={styles.titleRow}>
            <Text style={styles.app}>SuperLista</Text>
            <Text style={styles.dot}>•</Text>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.subtitle}>
            {formatListSubtitle(market)}
          </Text>
        </View>
      </Pressable>
      {/* Botão de perfil decorativo (sem login por enquanto). */}
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
        <Icon name="perfil" size={sizes.iconMd} color={colors.onPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  pressable: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.base,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  app: { ...typography.headlineSm, color: colors.onSurface },
  dot: { ...typography.labelMd, color: colors.onSurfaceVariant },
  title: { ...typography.labelLg, color: colors.primary, flexShrink: 1 },
  subtitle: { ...typography.bodySm, color: colors.onSurfaceVariant },
  avatar: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
