import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius } from "@/theme";

export type ProgressLevel = "ok" | "warning" | "over";

export type ProgressBarProps = {
  /** 0..1 (valores fora do intervalo são limitados). */
  progress: number;
  level?: ProgressLevel;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const BAR_HEIGHT = 8;
const PERCENT = 100;

const levelColor: Record<ProgressLevel, string> = {
  ok: colors.brand,
  warning: colors.gold,
  over: colors.danger,
};

export function ProgressBar({
  progress,
  level = "ok",
  accessibilityLabel = "Progresso",
  style,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const pct = Math.round(clamped * PERCENT);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: PERCENT, now: pct }}
      style={[styles.track, style]}
    >
      <View
        testID="progress-fill"
        style={[styles.fill, { width: `${pct}%`, backgroundColor: levelColor[level] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.stroke,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.full },
});