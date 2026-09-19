import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, hitTarget, sizes } from "@/theme";

import { Icon } from "./Icon";

export type CheckboxProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  accessibilityLabel: string;
};

const SIZE = sizes.checkbox;
const BORDER = 2;
const CHECK_SIZE = sizes.checkIcon;

export function Checkbox({ checked, onChange, accessibilityLabel }: CheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0);
  }, [checked, progress]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onChange?.(!checked);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      style={styles.hit}
    >
      <Animated.View
        style={[styles.circle, checked ? styles.circleChecked : styles.circleUnchecked]}
      >
        <Animated.View style={checkStyle}>
          <Icon name="check" size={CHECK_SIZE} color={colors.onPrimary} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: hitTarget, height: hitTarget, alignItems: "center", justifyContent: "center" },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  circleUnchecked: { backgroundColor: colors.card, borderColor: colors.strokeStrong },
  circleChecked: { backgroundColor: colors.brand, borderColor: colors.brand },
});