import fs from "node:fs";
import path from "node:path";

const mockSetColorScheme = jest.fn();

jest.mock("react-native/Libraries/Utilities/Appearance", () => ({
  ...jest.requireActual("react-native/Libraries/Utilities/Appearance"),
  setColorScheme: (...args: unknown[]) => mockSetColorScheme(...args),
}));
jest.mock("@expo-google-fonts/plus-jakarta-sans", () => ({ useFonts: () => [true] }));
jest.mock("expo-router", () => ({ Stack: Object.assign(() => null, { Screen: () => null }) }));
jest.mock("expo-splash-screen", () => ({ preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() }));
jest.mock("@/features/lists/DatabaseGate", () => ({ DatabaseGate: () => null }));

const ROOT = path.resolve(__dirname, "..");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });
}

describe("somente tema claro", () => {
  it("app/_layout força Appearance.setColorScheme('light') ao carregar", () => {
    require("../app/_layout");
    expect(mockSetColorScheme).toHaveBeenCalledWith("light");
  });

  it("nenhum arquivo de src/ ou app/ usa useColorScheme", () => {
    const files = [...walk(path.join(ROOT, "src")), ...walk(path.join(ROOT, "app"))];
    expect(files.length).toBeGreaterThan(20);
    const offenders = files
      .filter((f) => /useColorScheme/.test(fs.readFileSync(f, "utf8")))
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });

  it("app.json fixa userInterfaceStyle light e expo-system-ui está instalado", () => {
    const app = JSON.parse(fs.readFileSync(path.join(ROOT, "app.json"), "utf8"));
    expect(app.expo.userInterfaceStyle).toBe("light");
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
    expect(pkg.dependencies["expo-system-ui"]).toBeDefined();
  });
});