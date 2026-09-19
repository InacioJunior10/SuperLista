import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

import { elevation, radius, spacing } from "@/theme";

export type CardProps = ViewProps & { style?: StyleProp<ViewStyle> };

export function Card({ style, children, ...rest }: CardProps) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...elevation.level1, borderRadius: radius.lg, padding: spacing.base },
});