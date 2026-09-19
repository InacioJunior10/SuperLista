import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Alert, type AlertButton } from "react-native";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { ListsProvider } from "@/features/lists/ListsProvider";
import { formatBRL } from "@/utils/money";

import ListaScreen from "../app/(tabs)/index";
import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;

beforeEach(async () => {
  jest.restoreAllMocks();
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
});
afterEach(() => db.close());

async function renderScreen() {
  await render(
    <ListsProvider repository={repo}>
      <ListaScreen />
    </ListsProvider>,
  );
  await screen.findByText("Total da lista");
}

const persisted = async () => (await repo.listLists())[0];

/** Pressiona um botão do último Alert.alert. */
async function pressAlert(spy: jest.SpyInstance, text: string) {
  const buttons = spy.mock.calls[spy.mock.calls.length - 1][2] as AlertButton[];
  return act(async () => buttons.find((b) => b.text === text)?.onPress?.());
}

describe("Fase 6: itens, meta e info da lista", () => {
  it("estado vazio -> adicionar primeiro item; kg 0,8 => 800 g e sugestão de categoria", async () => {
    await repo.createList({ title: "Vazia" });
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Adicionar primeiro item" }));
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
    await user.type(screen.getByLabelText("Nome do item"), "Tomate");
    expect(screen.getByRole("button", { name: "Hortifrúti" })).toBeSelected();
    await user.press(screen.getByRole("button", { name: "Unidade kg" }));
    const qty = screen.getByLabelText("Quantidade");
    await user.clear(qty);
    await user.type(qty, "0,8");
    await user.press(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(async () => expect((await persisted()).items).toHaveLength(1));
    const item = (await persisted()).items[0];
    expect(item).toMatchObject({ name: "Tomate", category: "hortifruti", unit: "kg", quantity: 800 });
    expect(screen.getByText("Hortifrúti & Feira")).toBeTruthy();
    expect(screen.getByText("Tomate")).toBeTruthy();
  });

  it("categoria escolhida manualmente não é sobrescrita pela sugestão", async () => {
    await repo.createList({ title: "Vazia" });
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "+ Item" }));
    await user.press(screen.getByRole("button", { name: "Limpeza" }));
    await user.type(screen.getByLabelText("Nome do item"), "Leite");
    expect(screen.getByRole("button", { name: "Limpeza" })).toBeSelected();
  });

  it("edita item via long press", async () => {
    const list = await repo.createList({ title: "L" });
    await repo.addItem(list.id, { name: "Leite", category: "laticinios", unit: "un", quantity: 2 });
    const alert = jest.spyOn(Alert, "alert");
    await renderScreen();
    const user = userEvent.setup();
    await user.longPress(screen.getByRole("button", { name: /^Leite/ }));
    await pressAlert(alert, "Editar");
    const name = await screen.findByLabelText("Nome do item");
    await user.clear(name);
    await user.type(name, "Leite integral");
    await user.press(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(async () => expect((await persisted()).items[0].name).toBe("Leite integral"));
    expect((await persisted()).items[0].quantity).toBe(2);
  });

  it("remove item só após confirmação", async () => {
    const list = await repo.createList({ title: "L" });
    await repo.addItem(list.id, { name: "Leite" });
    const alert = jest.spyOn(Alert, "alert");
    await renderScreen();
    await userEvent.setup().longPress(screen.getByRole("button", { name: /^Leite/ }));
    await pressAlert(alert, "Remover");
    expect(alert.mock.calls[alert.mock.calls.length - 1][0]).toBe("Remover item?");
    expect((await persisted()).items).toHaveLength(1);
    await pressAlert(alert, "Remover");
    await waitFor(async () => expect((await persisted()).items).toHaveLength(0));
  });

  it("define, alerta e remove a meta", async () => {
    const list = await repo.createList({ title: "L" });
    await repo.addItem(list.id, { name: "Arroz", unitPriceCents: 900, checked: true });
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Definir meta" }));
    await user.type(screen.getByLabelText("Valor da meta"), "1000");
    await user.press(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText(`Meta: ${formatBRL(1000)}`)).toBeTruthy();
    expect(screen.getByText("Atenção: você já usou 90% da meta")).toBeTruthy();
    expect((await persisted()).budgetCents).toBe(1000);

    await user.press(screen.getByRole("button", { name: `Meta: ${formatBRL(1000)}` }));
    const input = screen.getByLabelText("Valor da meta");
    await user.clear(input);
    await user.type(input, "500");
    await user.press(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText(`Meta ultrapassada em ${formatBRL(400)}`)).toBeTruthy();

    await user.press(screen.getByRole("button", { name: `Meta: ${formatBRL(500)}` }));
    await user.press(screen.getByRole("button", { name: "Remover meta" }));
    expect(await screen.findByText("Definir meta")).toBeTruthy();
    expect((await persisted()).budgetCents).toBeUndefined();
  });

  it("edita título e mercado", async () => {
    await repo.createList({ title: "Velha", market: "A" });
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Editar lista Velha" }));
    const title = screen.getByLabelText("Título da lista");
    await user.clear(title);
    await user.type(title, "Nova");
    const market = screen.getByLabelText("Mercado");
    await user.clear(market);
    await user.type(market, "Extra");
    await user.press(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Nova")).toBeTruthy();
    expect(screen.getByText(/Extra/)).toBeTruthy();
    expect(await persisted()).toMatchObject({ title: "Nova", market: "Extra" });
  });

  it("unidade Gramas: chips Unidade/Kg/Gramas e quantidade inteira em gramas (padrão 100)", async () => {
    await repo.createList({ title: "Vazia" });
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "+ Item" }));
    expect(screen.getByRole("button", { name: "Unidade un" })).toBeTruthy();
    await user.type(screen.getByLabelText("Nome do item"), "Presunto");
    expect(screen.getByRole("button", { name: "Laticínios" })).toBeSelected();
    await user.press(screen.getByRole("button", { name: "Unidade g" }));
    expect(screen.getByText("Quantidade (g)")).toBeTruthy();
    expect(screen.getByLabelText("Quantidade").props.value).toBe("100");
    const qty = screen.getByLabelText("Quantidade");
    await user.clear(qty);
    await user.type(qty, "400");
    await user.press(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(async () => expect((await persisted()).items).toHaveLength(1));
    expect((await persisted()).items[0]).toMatchObject({ name: "Presunto", unit: "g", quantity: 400 });
    expect(screen.getByText("400 g")).toBeTruthy();
  });
});