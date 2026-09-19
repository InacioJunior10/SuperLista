import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bottomClearance, colors, spacing } from "@/theme";

export type ScreenContainerProps = {
  children?: ReactNode;
  /** Reserva folga inferior para a barra de totais/navegação fixa. Padrão: false (a barra de abas já ocupa o próprio espaço). */
  bottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ScreenContainer({ children, bottomInset = false, style }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View
        testID="screen-content"
        style={[styles.content, bottomInset && { paddingBottom: bottomClearance }, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, paddingHorizontal: spacing.base },
});