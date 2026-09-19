import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { ListsProvider, useShoppingList } from "@/features/lists/ListsProvider";
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
  jest.clearAllMocks();
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
});
afterEach(() => db.close());

// Total dos itens semeados: 820 (tomate) + 1000 (leite) + 0 (iogurte) + 300 (pão) = 2120
const SEED_TOTAL = 2120;

async function seed(budgetCents?: number) {
  const list = await repo.createList({
    title: "Compras do mês",
    market: "Pão de Açúcar",
    budgetCents,
  });
  const tomate = await repo.addItem(list.id, {
    name: "Tomate",
    category: "hortifruti",
    unit: "kg",
    quantity: 800,
    unitPriceCents: 1025,
  });
  await repo.addItem(list.id, {
    name: "Leite",
    category: "laticinios",
    unit: "un",
    quantity: 2,
    unitPriceCents: 500,
  });
  const iogurte = await repo.addItem(list.id, {
    name: "Iogurte",
    category: "laticinios",
    unit: "un",
    quantity: 2,
  });
  await repo.addItem(list.id, {
    name: "Pão",
    category: "padaria",
    unit: "un",
    quantity: 1,
    unitPriceCents: 300,
  });
  return { list, tomate, iogurte };
}

async function renderScreen(children: React.ReactNode = null) {
  await render(
    <ListsProvider repository={repo}>
      <ListaScreen />
      {children}
    </ListsProvider>,
  );
  await screen.findByText("Total da lista");
}

describe("Tela Lista de Compras", () => {
  it("mostra header, seções na ordem do PRD e detalhes", async () => {
    await seed();
    await renderScreen();
    expect(screen.getByText("Compras do mês")).toBeTruthy();
    expect(screen.getByText("Pão de Açúcar • Hoje")).toBeTruthy();
    const headers = screen
      .getAllByRole("header")
      .map((h) => h.props.children)
      .filter((c): c is string => typeof c === "string");
    const order = ["Hortifrúti & Feira", "Laticínios & Frios", "Padaria & Matinais"];
    expect(headers.filter((h) => order.includes(h))).toEqual(order);
    expect(screen.getByText("2 itens")).toBeTruthy();
    expect(screen.getAllByText("1 item")).toHaveLength(2);
    expect(screen.getByText(`0,800 kg × ${formatBRL(1025)}/kg`)).toBeTruthy();
    expect(screen.getByText("2 un")).toBeTruthy();
    expect(screen.getByText(`2 un × ${formatBRL(500)}`)).toBeTruthy();
    expect(screen.getByText("Dica da SuperLista")).toBeTruthy();
  });

  it("filtra por chip e volta com Todos", async () => {
    await seed();
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Padaria" }));
    expect(screen.getByText("Pão")).toBeTruthy();
    expect(screen.queryByText("Tomate")).toBeNull();
    await user.press(screen.getByRole("button", { name: "Todos" }));
    expect(screen.getByText("Tomate")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Carnes" })).toBeNull();
  });

  it("total do hero soma todos os itens; marcar só muda a contagem", async () => {
    await seed();
    await renderScreen();
    expect(screen.getByText(formatBRL(SEED_TOTAL))).toBeTruthy();
    expect(screen.getByText("0 de 4 pegos")).toBeTruthy();
    await userEvent
      .setup()
      .press(screen.getByRole("checkbox", { name: "Marcar Tomate como pego no carrinho" }));
    expect(await screen.findByText("1 de 4 pegos")).toBeTruthy();
    expect(screen.getByText(formatBRL(SEED_TOTAL))).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("badge 'Definir preço' quando o total do item é 0", async () => {
    await seed();
    await renderScreen();
    expect(screen.getAllByText("Definir preço")).toHaveLength(1);
  });

  it("tocar na linha navega para o modal de preço", async () => {
    const { tomate } = await seed();
    await renderScreen();
    await userEvent.setup().press(screen.getByText("Tomate"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/preco/[itemId]",
      params: { itemId: tomate.id },
    });
  });

  it("atualiza o total em tempo real quando o preço muda", async () => {
    const { iogurte } = await seed();
    let setPrice: (id: string, cents: number) => Promise<void> = async () => undefined;
    function Probe() {
      setPrice = useShoppingList().setItemPrice;
      return null;
    }
    await renderScreen(<Probe />);
    expect(screen.getByText(formatBRL(SEED_TOTAL))).toBeTruthy();
    await act(() => setPrice(iogurte.id, 250));
    expect(await screen.findByText(formatBRL(SEED_TOTAL + 500))).toBeTruthy();
    expect(screen.queryByText("Definir preço")).toBeNull();
  });

  it("Recalcular pede confirmação e desmarca ao confirmar", async () => {
    const { tomate } = await seed();
    await repo.updateItem(tomate.id, { checked: true });
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await renderScreen();
    expect(screen.getByText("1 de 4 pegos")).toBeTruthy();
    await userEvent.setup().press(screen.getByRole("button", { name: "Recalcular" }));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1 de 4 pegos")).toBeTruthy();
    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => buttons.find((b) => b.text === "Recalcular")?.onPress?.());
    expect(await screen.findByText("0 de 4 pegos")).toBeTruthy();
  });

  it("+ Item abre o formulário", async () => {
    await seed();
    await renderScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "+ Item" }));
    expect(screen.getByText("Novo item")).toBeTruthy();
  });

  it("meta com folga: sem aviso", async () => {
    await seed(10000);
    await renderScreen();
    expect(screen.getByText(`Meta: ${formatBRL(10000)}`)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("aviso a partir de 80% da meta", async () => {
    await seed(2500);
    await renderScreen();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Atenção/)).toBeTruthy();
  });

  it("aviso de meta ultrapassada", async () => {
    await seed(1000);
    await renderScreen();
    expect(screen.getByText(`Meta ultrapassada em ${formatBRL(SEED_TOTAL - 1000)}`)).toBeTruthy();
  });

  it("sem meta mostra 'Definir meta'", async () => {
    await seed();
    await renderScreen();
    expect(screen.getByText("Definir meta")).toBeTruthy();
  });

  it("lista vazia mostra CTA", async () => {
    await repo.createList({ title: "Vazia" });
    await renderScreen();
    expect(screen.getByText("Sua lista está vazia")).toBeTruthy();
    await userEvent.setup().press(screen.getByRole("button", { name: "Adicionar primeiro item" }));
    expect(screen.getByText("Novo item")).toBeTruthy();
  });

  it("mostra erro com 'Tentar novamente'", async () => {
    const failing = {
      ...repo,
      listLists: jest.fn().mockRejectedValue(new Error("x")),
    } as ListsRepository;
    await render(
      <ListsProvider repository={failing}>
        <ListaScreen />
      </ListsProvider>,
    );
    expect(await screen.findByText("Não foi possível carregar a lista")).toBeTruthy();
    await userEvent.setup().press(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(failing.listLists).toHaveBeenCalledTimes(2));
  });

  it("mostra o estado de carregamento", async () => {
    const pending = { ...repo, listLists: () => new Promise(() => undefined) } as ListsRepository;
    await render(
      <ListsProvider repository={pending}>
        <ListaScreen />
      </ListsProvider>,
    );
    expect(screen.getByTestId("lista-carregando")).toBeTruthy();
  });

  it("renderiza 200 itens sem erro", async () => {
    const list = await repo.createList({ title: "Grande" });
    for (let i = 0; i < 200; i++) {
      await repo.addItem(list.id, {
        name: `Item ${i}`,
        category: i % 2 ? "carnes" : "limpeza",
        unitPriceCents: 100,
      });
    }
    await renderScreen();
    expect(screen.getByText("0 de 200 pegos")).toBeTruthy();
    expect(screen.getByText(formatBRL(20000))).toBeTruthy();
    expect(screen.getByText("Item 1")).toBeTruthy();
  });
});
