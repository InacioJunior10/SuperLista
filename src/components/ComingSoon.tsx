import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

import { ScreenContainer } from "./ScreenContainer";

export type ComingSoonProps = { title: string };

/** Placeholder das abas ainda não implementadas. */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>Em breve</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { ...typography.headlineMd, color: colors.slateMuted },
  subtitle: { ...typography.bodyMd, marginTop: spacing.sm, color: colors.slateMuted },
});