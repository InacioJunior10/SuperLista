import fs from "node:fs";
import path from "node:path";

import { render } from "@testing-library/react-native";

import TabsLayout from "../app/(tabs)/_layout";

type TabsProps = { screenOptions: { tabBarHideOnKeyboard?: boolean; tabBarStyle: Record<string, unknown> } };
let captured: TabsProps | undefined;

jest.mock("expo-router", () => {
  function Tabs(props: TabsProps) {
    captured = props;
    return null;
  }
  Tabs.Screen = function Screen() {
    return null;
  };
  return { Tabs };
});
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 20 }),
}));

describe("menu inferior fixo", () => {
  it("tabBarStyle tem altura numérica, sem position absolute e sem esconder com o teclado", async () => {
    await render(<TabsLayout />);
    const options = captured?.screenOptions;
    expect(typeof options?.tabBarStyle.height).toBe("number");
    expect(options?.tabBarStyle.height).toBe(56 + 20);
    expect(options?.tabBarStyle.paddingBottom).toBe(20);
    expect(options?.tabBarStyle.position).toBeUndefined();
    expect(options?.tabBarHideOnKeyboard).toBe(false);
  });

  it("nenhuma lista do app usa removeClippedSubviews", () => {
    const ROOT = path.resolve(__dirname, "..");
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return /\.tsx?$/.test(e.name) ? [full] : [];
      });
    const offenders = [...walk(path.join(ROOT, "src")), ...walk(path.join(ROOT, "app"))]
      .filter((f) => /removeClippedSubviews/.test(fs.readFileSync(f, "utf8")))
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });
});
