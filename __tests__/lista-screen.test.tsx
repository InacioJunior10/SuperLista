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

// Soma de todos os itens semeados: 820 (tomate) + 1000 (leite) + 0 (iogurte) + 300 (pão) = 2120.
// O total do topo só conta os itens pegos; com `pego: true` todos já vêm marcados.
const SEED_TOTAL = 2120;

async function seed(budgetCents?: number, pego = false) {
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
    checked: pego,
  });
  await repo.addItem(list.id, {
    name: "Leite",
    category: "laticinios",
    unit: "un",
    quantity: 2,
    unitPriceCents: 500,
    checked: pego,
  });
  const iogurte = await repo.addItem(list.id, {
    name: "Iogurte",
    category: "laticinios",
    unit: "un",
    quantity: 2,
    checked: pego,
  });
  await repo.addItem(list.id, {
    name: "Pão",
    category: "padaria",
    unit: "un",
    quantity: 1,
    unitPriceCents: 300,
    checked: pego,
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
  await screen.findByText("Total estimado no carrinho");
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

  it("marcar item não remonta a tela nem o cabeçalho", async () => {
    await seed();
    await renderScreen();
    const content = screen.getByTestId("screen-content");
    const title = screen.getByText("Compras do mês");
    const user = userEvent.setup();
    await user.press(screen.getByRole("checkbox", { name: "Marcar Tomate como pego no carrinho" }));
    expect(await screen.findByText("1 de 4 pegos")).toBeTruthy();
    expect(screen.queryByTestId("lista-carregando")).toBeNull();
    expect(screen.getByTestId("screen-content")).toBe(content);
    expect(screen.getByText("Compras do mês")).toBe(title);
  });

  it("filtra por chip e volta com Todos", async () => {
    await seed();
    await renderScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Padaria" }));
    expect(screen.getByText("Pão")).toBeTruthy();
    expect(screen.queryByText("Tomate")).toBeNull();
    await user.press(screen.getByRole("button", { name: "Todos (4)" }));
    expect(screen.getByText("Tomate")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Carnes" })).toBeNull();
  });

  it("total do hero soma só os pegos; marcar e desmarcar recalcula", async () => {
    await seed();
    await renderScreen();
    expect(screen.getByText(formatBRL(0))).toBeTruthy();
    expect(screen.getByText("0 de 4 pegos")).toBeTruthy();
    const user = userEvent.setup();
    await user.press(screen.getByRole("checkbox", { name: "Marcar Tomate como pego no carrinho" }));
    expect(await screen.findByText("1 de 4 pegos")).toBeTruthy();
    expect(screen.getAllByText(formatBRL(820))).toHaveLength(2); // badge do item + hero
    await user.press(screen.getByRole("checkbox", { name: "Marcar Leite como pego no carrinho" }));
    expect(await screen.findByText(formatBRL(1820))).toBeTruthy();
    await user.press(screen.getByRole("checkbox", { name: /Tomate/ }));
    expect(await screen.findAllByText(formatBRL(1000))).toHaveLength(2); // badge do Leite + hero
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
    await repo.updateItem(iogurte.id, { checked: true });
    let setPrice: (id: string, cents: number) => Promise<void> = async () => undefined;
    function Probe() {
      setPrice = useShoppingList().setItemPrice;
      return null;
    }
    await renderScreen(<Probe />);
    expect(screen.getByText(formatBRL(0))).toBeTruthy();
    await act(() => setPrice(iogurte.id, 250));
    expect(await screen.findAllByText(formatBRL(500))).toHaveLength(2); // badge do iogurte + hero
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
    await seed(2500, true);
    await renderScreen();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Atenção/)).toBeTruthy();
  });

  it("aviso de meta ultrapassada", async () => {
    await seed(1000, true);
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
        checked: i < 150,
      });
    }
    await renderScreen();
    expect(screen.getByText("150 de 200 pegos")).toBeTruthy();
    expect(screen.getByText(formatBRL(15000))).toBeTruthy();
    expect(screen.getByText("Item 1")).toBeTruthy();
  });

  it("mostra os textos do modelo: total estimado, progresso, pendentes e Todos (N)", async () => {
    const { tomate } = await seed();
    await renderScreen();
    expect(screen.getByText("Progresso de itens")).toBeTruthy();
    expect(screen.getByText("4 itens pendentes ignorados")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Todos (4)" })).toBeTruthy();
    await userEvent.setup().press(screen.getByRole("checkbox", { name: /Marcar Tomate/ }));
    expect(await screen.findByText("3 itens pendentes ignorados")).toBeTruthy();
    for (const name of ["Leite", "Iogurte", "Pão"]) {
      await userEvent.setup().press(screen.getByRole("checkbox", { name: new RegExp(name) }));
    }
    expect(await screen.findByText("Todos os itens no carrinho!")).toBeTruthy();
    expect(tomate.id).toBeTruthy();
  });

  it("singular: 1 item pendente ignorado", async () => {
    await seed(undefined, true);
    const items = (await repo.listLists())[0].items;
    await repo.updateItem(items[0].id, { checked: false });
    await renderScreen();
    expect(screen.getByText("1 item pendente ignorado")).toBeTruthy();
  });

  describe("lixeira", () => {
    const lixeira = (name: string) => screen.getByRole("button", { name: `Excluir ${name}` });

    it("há um botão Excluir por item", async () => {
      await seed();
      await renderScreen();
      for (const n of ["Tomate", "Leite", "Iogurte", "Pão"]) expect(lixeira(n)).toBeTruthy();
      expect(screen.getAllByRole("button", { name: /^Excluir / })).toHaveLength(4);
    });

    it("pede confirmação; Cancelar não exclui e não abre o modal de preço", async () => {
      await seed();
      const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
      await renderScreen();
      await userEvent.setup().press(lixeira("Leite"));
      expect(alert.mock.calls[0][0]).toBe("Excluir item?");
      expect(alert.mock.calls[0][1]).toBe('Excluir "Leite" da lista?');
      const buttons = alert.mock.calls[0][2] ?? [];
      expect(buttons.find((b) => b.text === "Cancelar")?.style).toBe("cancel");
      expect(buttons.find((b) => b.text === "Excluir")?.style).toBe("destructive");
      await act(async () => buttons.find((b) => b.text === "Cancelar")?.onPress?.());
      expect(screen.getByText("Leite")).toBeTruthy();
      expect((await repo.listLists())[0].items).toHaveLength(4);
      expect(router.push).not.toHaveBeenCalled();
    });

    it("Excluir remove o item e recalcula o total dos pegos", async () => {
      await seed(undefined, true);
      const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
      await renderScreen();
      expect(screen.getByText("4 de 4 pegos")).toBeTruthy();
      expect(screen.getByText(formatBRL(SEED_TOTAL))).toBeTruthy();
      await userEvent.setup().press(lixeira("Leite"));
      const buttons = alert.mock.calls[0][2] ?? [];
      await act(async () => buttons.find((b) => b.text === "Excluir")?.onPress?.());
      expect(await screen.findByText("3 de 3 pegos")).toBeTruthy();
      expect(screen.getByText(formatBRL(SEED_TOTAL - 1000))).toBeTruthy();
      expect(screen.queryByText("Leite")).toBeNull();
      await waitFor(async () => expect((await repo.listLists())[0].items).toHaveLength(3));
      expect(router.push).not.toHaveBeenCalled();
    });
  });
});
