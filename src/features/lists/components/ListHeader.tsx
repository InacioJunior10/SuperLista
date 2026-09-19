import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { colors, radius, sizes, spacing, typography } from "@/theme";
import { formatListSubtitle } from "@/utils/format";

export type ListHeaderProps = { title: string; market?: string };

const AVATAR = sizes.iconLg + spacing.base;

export function ListHeader({ title, market }: ListHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {formatListSubtitle(market)}
        </Text>
      </View>
      {/* Placeholder decorativo do perfil (sem login por enquanto). */}
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
        <MaterialCommunityIcons
          name="account-outline"
          size={sizes.iconLg}
          color={colors.slateMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  texts: { flex: 1 },
  title: { ...typography.headlineMd, color: colors.slate },
  subtitle: { ...typography.bodyMd, color: colors.slateMuted },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.full,
    backgroundColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
});
