import { render, screen, userEvent } from "@testing-library/react-native";
import { useState } from "react";

import { Dropdown } from "@/components";
import { convertQuantity } from "@/utils/weight";

const OPTIONS = [
  { value: "a", label: "Opção A" },
  { value: "b", label: "Opção B" },
] as const;

function Harness() {
  const [v, setV] = useState<"a" | "b">("a");
  return <Dropdown label="Escolha" value={v} options={OPTIONS} onChange={setV} />;
}

describe("Dropdown", () => {
  it("abre, mostra opções com role radio/selected e fecha ao selecionar", async () => {
    await render(<Harness />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Escolha" });
    expect(trigger.props.accessibilityState.expanded).toBe(false);
    expect(screen.queryByRole("radio")).toBeNull();
    await user.press(trigger);
    expect(screen.getByRole("button", { name: "Escolha" }).props.accessibilityState.expanded).toBe(true);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "Opção A" }).props.accessibilityState.selected).toBe(true);
    await user.press(screen.getByRole("radio", { name: "Opção B" }));
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByRole("button", { name: "Escolha" }).props.accessibilityValue.text).toBe("Opção B");
  });

  it("tocar de novo no gatilho fecha", async () => {
    await render(<Harness />);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Escolha" }));
    await user.press(screen.getByRole("button", { name: "Escolha" }));
    expect(screen.queryByRole("radio")).toBeNull();
  });
});

describe("convertQuantity", () => {
  it("regras de conversão entre unidades", () => {
    expect(convertQuantity("kg", "g", 800)).toBe(800);
    expect(convertQuantity("g", "kg", 500)).toBe(500);
    expect(convertQuantity("un", "kg", 3)).toBe(1000);
    expect(convertQuantity("un", "g", 3)).toBe(100);
    expect(convertQuantity("kg", "un", 800)).toBe(1);
    expect(convertQuantity("g", "pct", 500)).toBe(1);
    expect(convertQuantity("un", "pct", 4)).toBe(4);
    expect(convertQuantity("pct", "un", 4)).toBe(4);
  });
});
