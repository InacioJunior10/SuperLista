import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components";
import type { CategorySection } from "@/features/lists/grouping";
import { colors, radius, sizes, spacing, typography } from "@/theme";

export type CategorySectionHeaderProps = {
  section: Pick<CategorySection, "category" | "countLabel">;
};

const ICON_BOX = sizes.iconLg + spacing.sm;

export function CategorySectionHeader({ section }: CategorySectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Icon name={section.category.key} size={sizes.iconMd} color={colors.brand} />
      </View>
      <Text accessibilityRole="header" style={styles.name}>
        {section.category.label}
      </Text>
      <Text style={styles.count}>{section.countLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    backgroundColor: colors.canvas,
  },
  icon: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: radius.full,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...typography.headlineSm, flex: 1, color: colors.slate },
  count: { ...typography.bodyMd, color: colors.slateMuted },
});
