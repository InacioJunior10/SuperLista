import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Appearance } from "react-native";

import { DatabaseGate } from "@/features/lists/DatabaseGate";
import { colors } from "@/theme";

// Somente tema claro: ignora o modo escuro do sistema (diálogos, teclado e componentes nativos).
Appearance.setColorScheme("light");

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!loaded) return null;

  return (
    <DatabaseGate onSettled={() => void SplashScreen.hideAsync()}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="preco/[itemId]" options={{ presentation: "modal" }} />
      </Stack>
    </DatabaseGate>
  );
}
