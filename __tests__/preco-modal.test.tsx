import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text } from "react-native";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { ListsProvider, useShoppingList } from "@/features/lists/ListsProvider";
import { formatBRL } from "@/utils/money";

import PrecoModal from "../app/preco/[itemId]";
import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;

beforeEach(async () => {
  jest.clearAllMocks();
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
});
afterEach(() => db.close());

async function seed() {
  const list = await repo.createList({ title: "L" });
  const tomate = await repo.addItem(list.id, {
    name: "Tomate",
    category: "hortifruti",
    unit: "kg",
    quantity: 800,
    unitPriceCents: 1025,
  });
  const leite = await repo.addItem(list.id, {
    name: "Leite",
    category: "laticinios",
    unit: "un",
    quantity: 2,
  });
  return { tomate, leite };
}

function Probe() {
  return <Text testID="total">{useShoppingList().estimatedTotalCents}</Text>;
}
const total = () => Number(screen.getByTestId("total").props.children);

async function open(itemId: string) {
  jest.mocked(useLocalSearchParams).mockReturnValue({ itemId });
  await render(
    <ListsProvider repository={repo}>
      <PrecoModal />
      <Probe />
    </ListsProvider>,
  );
  await screen.findByText("VALOR TOTAL NO PACOTE");
}

describe("Modal Informar Preço", () => {
  it("mostra header, total ao vivo e fórmula do item kg", async () => {
    const { tomate } = await seed();
    await open(tomate.id);
    expect(screen.getByText("Hortifrúti & Feira")).toBeTruthy();
    expect(screen.getByLabelText("Nome do item").props.value).toBe("Tomate");
    expect(screen.getByText(formatBRL(820))).toBeTruthy();
    expect(screen.getByText("Pesagem: 0,800 kg × R$ 10,25/kg")).toBeTruthy();
    expect(screen.getByText("Bandeja com 800 gramas")).toBeTruthy();
    expect(screen.getByText("0,8 kg")).toBeTruthy();
  });

  it("item de preço 0 abre com R$ 0,00 e a máscara formata a digitação", async () => {
    const { leite } = await seed();
    await open(leite.id);
    const input = screen.getByLabelText("Preço unitário");
    expect(input.props.value).toBe("R$ 0,00");
    expect(screen.getByText("2 un × R$ 0,00")).toBeTruthy();
    expect(screen.getByText("Quantidade em unidades")).toBeTruthy();
    await userEvent.setup().type(input, "1025");
    expect(screen.getByLabelText("Preço unitário").props.value).toBe("R$ 10,25");
    expect(screen.getByText("2 un × R$ 10,25")).toBeTruthy();
    expect(screen.getByText(formatBRL(2050))).toBeTruthy();
  });

  it("chips somam e Zerar zera", async () => {
    const { leite } = await seed();
    await open(leite.id);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "+R$ 0,50" }));
    await user.press(screen.getByRole("button", { name: "+R$ 5,00" }));
    expect(screen.getByLabelText("Preço unitário").props.value).toBe("R$ 5,50");
    await user.press(screen.getByRole("button", { name: "Zerar" }));
    expect(screen.getByLabelText("Preço unitário").props.value).toBe("R$ 0,00");
  });

  it("stepper kg em passos de 50 g", async () => {
    const { tomate } = await seed();
    await open(tomate.id);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Aumentar quantidade" }));
    expect(screen.getByText("0,85 kg")).toBeTruthy();
    expect(screen.getByText("Bandeja com 850 gramas")).toBeTruthy();
    expect(screen.getByText(formatBRL(871))).toBeTruthy();
    await user.press(screen.getByRole("button", { name: "Diminuir quantidade" }));
    expect(screen.getByText("0,8 kg")).toBeTruthy();
  });

  it("stepper un de 1 em 1 com mínimo 1", async () => {
    const { leite } = await seed();
    await open(leite.id);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Diminuir quantidade" }));
    expect(screen.getByText("1 un")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Diminuir quantidade" }).props.accessibilityState.disabled).toBe(true);
  });

  it("Salvar Preço persiste, atualiza o total do provider e volta", async () => {
    const { leite } = await seed();
    await open(leite.id);
    expect(total()).toBe(820);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "+R$ 2,00" }));
    await user.press(screen.getByRole("button", { name: "Aumentar quantidade" }));
    await user.press(screen.getByRole("checkbox", { name: "Marcar como pego no carrinho" }));
    await user.press(screen.getByRole("button", { name: "Salvar Preço" }));
    const saved = await repo.getItem(leite.id);
    expect(saved).toMatchObject({ unitPriceCents: 200, quantity: 3, checked: true });
    expect(router.back).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(total()).toBe(820 + 600));
  });

  it("Sair sem mudança volta direto", async () => {
    const { leite } = await seed();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await open(leite.id);
    await userEvent.setup().press(screen.getByRole("button", { name: "Sair" }));
    expect(alert).not.toHaveBeenCalled();
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("Sair com mudança pede confirmação e não persiste", async () => {
    const { leite } = await seed();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await open(leite.id);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "+R$ 1,00" }));
    await user.press(screen.getByRole("button", { name: "Sair" }));
    expect(alert).toHaveBeenCalledWith("Descartar alterações?", expect.any(String), expect.any(Array));
    expect(router.back).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => buttons.find((b) => b.text === "Descartar")?.onPress?.());
    expect(router.back).toHaveBeenCalledTimes(1);
    expect((await repo.getItem(leite.id))?.unitPriceCents).toBe(0);
  });

  it("item inexistente volta", async () => {
    await seed();
    jest.mocked(useLocalSearchParams).mockReturnValue({ itemId: "nao-existe" });
    await render(
      <ListsProvider repository={repo}>
        <PrecoModal />
      </ListsProvider>,
    );
    await act(async () => undefined);
    expect(router.back).toHaveBeenCalled();
  });
});



describe("Modal Informar Preço: unidade g", () => {
  it("mostra gramas, preço por kg, passos de 50 g e total pelo mesmo cálculo do kg", async () => {
    const list = await repo.createList({ title: "L" });
    const item = await repo.addItem(list.id, {
      name: "Presunto",
      category: "laticinios",
      unit: "g",
      quantity: 500,
      unitPriceCents: 4290,
    });
    await open(item.id);
    expect(screen.getByText("Preço por kg")).toBeTruthy();
    expect(screen.getByText("Pesagem: 500 g × R$ 42,90/kg")).toBeTruthy();
    expect(screen.getByText("500 g")).toBeTruthy();
    expect(screen.getByText(formatBRL(2145))).toBeTruthy();
    await userEvent.setup().press(screen.getByRole("button", { name: "Aumentar quantidade" }));
    expect(screen.getByText("550 g")).toBeTruthy();
    expect(screen.getByText("Pesagem: 550 g × R$ 42,90/kg")).toBeTruthy();
  });
});
describe("Modal Informar Preço: nome editável", () => {
  it("mostra o nome atual, edita e salva junto com o preço; o nome novo chega ao provider", async () => {
    const { leite } = await seed();
    await open(leite.id);
    const input = screen.getByLabelText("Nome do item");
    expect(input.props.value).toBe("Leite");
    expect(input.props.maxLength).toBe(80);
    const user = userEvent.setup();
    await user.clear(input);
    await user.type(input, "  Leite integral ");
    await user.press(screen.getByRole("button", { name: "+R$ 5,00" }));
    await user.press(screen.getByRole("button", { name: "Salvar Preço" }));
    expect(await repo.getItem(leite.id)).toMatchObject({ name: "Leite integral", unitPriceCents: 500 });
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("nome vazio desabilita Salvar e mostra a mensagem", async () => {
    const { leite } = await seed();
    await open(leite.id);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Nome do item"));
    expect(screen.getByText("Informe o nome do item.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Salvar Preço" }).props.accessibilityState.disabled).toBe(true);
    await user.type(screen.getByLabelText("Nome do item"), "   ");
    expect(screen.getByRole("button", { name: "Salvar Preço" }).props.accessibilityState.disabled).toBe(true);
  });

  it("só alterar o nome já pede confirmação no Sair", async () => {
    const { leite } = await seed();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await open(leite.id);
    await userEvent.setup().type(screen.getByLabelText("Nome do item"), "s");
    await userEvent.setup().press(screen.getByRole("button", { name: "Sair" }));
    expect(alert).toHaveBeenCalledWith("Descartar alterações?", expect.any(String), expect.any(Array));
    expect(router.back).not.toHaveBeenCalled();
  });
});

describe("Modal Informar Preço: dropdown do tipo de quantidade", () => {
  const pick = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
    await user.press(screen.getByRole("button", { name: "Tipo de quantidade" }));
    await user.press(screen.getByRole("radio", { name: label }));
  };

  it("abre com as 4 opções e fecha ao selecionar", async () => {
    const { leite } = await seed();
    await open(leite.id);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Tipo de quantidade" }));
    expect(screen.getAllByRole("radio").map((r) => r.props.accessibilityLabel)).toEqual([
      "Unidade",
      "Quilo (kg)",
      "Gramas (g)",
      "Pacote",
    ]);
    await user.press(screen.getByRole("radio", { name: "Pacote" }));
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("un -> pct mantém a contagem e troca rótulos e fórmula", async () => {
    const { leite } = await seed();
    await open(leite.id);
    await pick(userEvent.setup(), "Pacote");
    expect(screen.getByText("Preço por pacote")).toBeTruthy();
    expect(screen.getByText("Quantidade em pacotes")).toBeTruthy();
    expect(screen.getByText("2 pacotes × R$ 0,00")).toBeTruthy();
    expect(screen.getByText("2 pct")).toBeTruthy();
    await pick(userEvent.setup(), "Unidade");
    expect(screen.getByText("2 un × R$ 0,00")).toBeTruthy();
  });

  it("kg -> g mantém gramas; kg -> un vira 1; un -> kg vira 1000", async () => {
    const { tomate } = await seed();
    await open(tomate.id);
    const user = userEvent.setup();
    await pick(user, "Gramas (g)");
    expect(screen.getByText("800 g")).toBeTruthy();
    expect(screen.getByText("Pesagem: 800 g × R$ 10,25/kg")).toBeTruthy();
    await pick(user, "Unidade");
    expect(screen.getByText("Preço por unidade")).toBeTruthy();
    expect(screen.getByText("1 un × R$ 10,25")).toBeTruthy();
    await pick(user, "Quilo (kg)");
    expect(screen.getByText("1 kg")).toBeTruthy();
    expect(screen.getByText("Pesagem: 1,000 kg × R$ 10,25/kg")).toBeTruthy();
  });

  it("un -> g vira 100 g", async () => {
    const { leite } = await seed();
    await open(leite.id);
    await pick(userEvent.setup(), "Gramas (g)");
    expect(screen.getByText("100 g")).toBeTruthy();
  });

  it("Salvar persiste a unidade nova e o total do topo recalcula", async () => {
    const { tomate } = await seed();
    await open(tomate.id);
    expect(total()).toBe(820);
    const user = userEvent.setup();
    await pick(user, "Pacote");
    await user.press(screen.getByRole("button", { name: "Aumentar quantidade" }));
    await user.press(screen.getByRole("button", { name: "Salvar Preço" }));
    expect(await repo.getItem(tomate.id)).toMatchObject({ unit: "pct", quantity: 2, unitPriceCents: 1025 });
    await waitFor(() => expect(total()).toBe(2050));
  });

  it("trocar só a unidade conta como alteração pendente", async () => {
    const { leite } = await seed();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await open(leite.id);
    const user = userEvent.setup();
    await pick(user, "Pacote");
    await user.press(screen.getByRole("button", { name: "Sair" }));
    expect(alert).toHaveBeenCalled();
  });
});
