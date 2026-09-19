import { render, screen, userEvent } from "@testing-library/react-native";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { seedIfEmpty } from "@/db/seed";
import { ListsProvider } from "@/features/lists/ListsProvider";

import Ajustes from "../app/(tabs)/ajustes";
import Carrinho from "../app/(tabs)/carrinho";
import ListaScreen from "../app/(tabs)/index";
import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/db/client", () => ({ getListsRepository: async () => null }));

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
  await seedIfEmpty(repo);
  const list = (await repo.listLists())[0];
  await repo.updateItem(list.items[0].id, { checked: true }); // ao menos um item no Carrinho
});
afterEach(() => db.close());

/** Todo botão/checkbox precisa de nome acessível (accessibilityLabel) e todo TextInput também. */
function expectAllLabelled() {
  const controls = [...screen.queryAllByRole("button"), ...screen.queryAllByRole("checkbox")];
  expect(controls.length).toBeGreaterThan(0);
  const unnamed = controls.filter((c) => !c.props.accessibilityLabel && !c.props["aria-label"]);
  expect(unnamed.map((c) => c.props.testID ?? c.type)).toEqual([]);
  const inputs = screen.queryAllByDisplayValue(/(?:)/);
  expect(inputs.filter((i) => !i.props.accessibilityLabel)).toEqual([]);
}

const withProvider = (ui: React.ReactElement) => <ListsProvider repository={repo}>{ui}</ListsProvider>;

describe("auditoria de acessibilidade", () => {
  it("Lista, com os sheets de item, meta e info", async () => {
    await render(withProvider(<ListaScreen />));
    await screen.findByText("Total estimado no carrinho");
    expectAllLabelled();
    const user = userEvent.setup();

    await user.press(screen.getByRole("button", { name: "+ Item" }));
    expect(screen.getByText("Novo item")).toBeTruthy();
    expectAllLabelled();
    await user.press(screen.getByRole("button", { name: "Cancelar" }));
    await user.press(screen.getByRole("button", { name: /^Editar lista/ }));
    expect(screen.getByText("Editar lista")).toBeTruthy();
    expectAllLabelled();
  });

  it("Carrinho", async () => {
    await render(withProvider(<Carrinho />));
    await screen.findByText("Total do carrinho");
    expectAllLabelled();
  });

  it("Ajustes", async () => {
    await render(withProvider(<Ajustes />));
    expectAllLabelled();
  });
});
