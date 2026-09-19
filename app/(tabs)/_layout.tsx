import { Tabs } from "expo-router";

import { Icon, type IconName } from "@/components";
import { colors, elevation, typography } from "@/theme";

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Lista", icon: "lista" },
  { name: "historico", title: "Histórico", icon: "historico" },
  { name: "carrinho", title: "Carrinho", icon: "carrinho" },
  { name: "ajustes", title: "Ajustes", icon: "ajustes" },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.slateMuted,
        tabBarLabelStyle: typography.labelSm,
        tabBarStyle: {
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
