import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components";
import { colors, elevation, sizes, spacing, typography } from "@/theme";

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Lista", icon: "lista" },
  { name: "historico", title: "Histórico", icon: "historico" },
  { name: "carrinho", title: "Carrinho", icon: "carrinho" },
  { name: "ajustes", title: "Ajustes", icon: "ajustes" },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.slateMuted,
        tabBarLabelStyle: typography.labelSm,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          height: sizes.tabBar + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: spacing.xs,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...elevation.totalizer,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={tab.icon}
                size={size}
                color={focused ? colors.brand : colors.slateMuted}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
