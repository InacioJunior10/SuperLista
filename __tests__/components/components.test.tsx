import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { Text } from "react-native";

import {
  Button,
  Card,
  Checkbox,
  Chip,
  Icon,
  MoneyText,
  PriceBadge,
  ProgressBar,
  ScreenContainer,
  Stepper,
} from "@/components";
import { colors } from "@/theme";

// Mocks de Reanimated, vector-icons e haptics vêm de jest.setup.tsx.

describe("Button", () => {
  it("dispara onPress e expõe role/label", async () => {
    const onPress = jest.fn();
    await render(<Button label="Salvar Preço" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Salvar Preço" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it("não dispara quando desabilitado", async () => {
    const onPress = jest.fn();
    await render(<Button label="X" variant="tertiary" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("Chip", () => {
  it("reflete estado ativo e chama onPress", async () => {
    const onPress = jest.fn();
    await render(<Chip label="Padaria" active onPress={onPress} />);
    const chip = screen.getByRole("button", { name: "Padaria" });
    expect(chip.props.accessibilityState.selected).toBe(true);
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalled();
  });
  it("inativo", async () => {
    await render(<Chip label="Carnes" />);
    expect(screen.getByRole("button").props.accessibilityState.selected).toBe(false);
  });
});

describe("Checkbox", () => {
  it("alterna, chama haptic e expõe state", async () => {
    const onChange = jest.fn();
    await render(<Checkbox checked={false} onChange={onChange} accessibilityLabel="Arroz" />);
    const cb = screen.getByRole("checkbox", { name: "Arroz" });
    expect(cb.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(cb);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });
  it("marcado", async () => {
    await render(<Checkbox checked accessibilityLabel="Leite" />);
    expect(screen.getByRole("checkbox").props.accessibilityState.checked).toBe(true);
  });
});

describe("PriceBadge", () => {
  it("mostra preço formatado", async () => {
    const onPress = jest.fn();
    await render(<PriceBadge cents={820} onPress={onPress} />);
    expect(screen.getByText("R$ 8,20")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalled();
  });
  it("variante Definir preço quando ausente", async () => {
    await render(<PriceBadge />);
    expect(screen.getByText("Definir preço")).toBeTruthy();
  });
  it("variante Definir preço quando o preço é 0 (padrão)", async () => {
    await render(<PriceBadge cents={0} />);
    expect(screen.getByText("Definir preço")).toBeTruthy();
    expect(screen.queryByText("R$ 0,00")).toBeNull();
  });
});

describe("ProgressBar", () => {
  it("define largura e valor de acessibilidade", async () => {
    await render(<ProgressBar progress={0.5} />);
    expect(screen.getByRole("progressbar").props.accessibilityValue.now).toBe(50);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "50%" });
  });
  it("usa cores por nível e limita valores", async () => {
    await render(<ProgressBar progress={2} level="over" />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({
      width: "100%",
      backgroundColor: colors.danger,
    });
  });
  it("warning é dourado", async () => {
    await render(<ProgressBar progress={0.9} level="warning" />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ backgroundColor: colors.gold });
  });
});

describe("Stepper", () => {
  it("incrementa e decrementa", async () => {
    const onChange = jest.fn();
    await render(<Stepper value={2} unit="kg" onChange={onChange} />);
    expect(screen.getByText("2 kg")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Aumentar quantidade" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await fireEvent.press(screen.getByRole("button", { name: "Diminuir quantidade" }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
  it("respeita o mínimo", async () => {
    const onChange = jest.fn();
    await render(<Stepper value={1} min={1} onChange={onChange} />);
    await fireEvent.press(screen.getByRole("button", { name: "Diminuir quantidade" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Card, Icon, MoneyText, ScreenContainer", () => {
  it("Card renderiza filhos", async () => {
    await render(
      <Card>
        <Text>dentro</Text>
      </Card>,
    );
    expect(screen.getByText("dentro")).toBeTruthy();
  });
  it("Icon renderiza", async () => {
    await render(<Icon name="carrinho" />);
    expect(screen.toJSON()).toBeTruthy();
  });
  it("MoneyText formata centavos", async () => {
    await render(<MoneyText cents={16886} />);
    expect(screen.getByText("R$ 168,86")).toBeTruthy();
  });
  it("ScreenContainer usa fundo canvas", async () => {
    await render(
      <ScreenContainer>
        <Text>tela</Text>
      </ScreenContainer>,
    );
    expect(screen.getByText("tela")).toBeTruthy();
    expect(screen.getByTestId("screen-content")).not.toHaveStyle({ paddingBottom: 80 });
  });
});
