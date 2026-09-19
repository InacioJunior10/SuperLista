import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { migrate } from "@/db/migrations";
import { createListsRepository, type ListsRepository } from "@/db/repository";
import { ListsProvider } from "@/features/lists/ListsProvider";
import { clearAllData } from "@/features/settings/clearAllData";

import Ajustes from "../app/(tabs)/ajustes";
import { createTestDb } from "../test-utils/sqliteTestDb";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
const mockClient = { repo: null as ListsRepository | null };
jest.mock("@/db/client", () => ({ getListsRepository: async () => mockClient.repo }));

let db: ReturnType<typeof createTestDb>;
let repo: ListsRepository;

beforeEach(async () => {
  jest.restoreAllMocks();
  db = createTestDb();
  await migrate(db);
  repo = createListsRepository(db);
  mockClient.repo = repo;
});
afterEach(() => db.close());

async function seed() {
  for (const title of ["A", "B"]) {
    const list = await repo.createList({ title });
    await repo.addItem(list.id, {
      name: "Arroz",
      category: "hortifruti",
      unit: "un",
      quantity: 1,
      unitPriceCents: 500,
    });
  }
}

describe("clearAllData", () => {
  it("apaga todas as listas e itens", async () => {
    await seed();
    await clearAllData(repo);
    expect(await repo.listLists()).toHaveLength(0);
    const rows = await db.getAllAsync("SELECT id FROM items");
    expect(rows).toHaveLength(0);
  });
});

describe("tela Ajustes", () => {
  async function renderScreen() {
    await render(
      <ListsProvider repository={repo}>
        <Ajustes />
      </ListsProvider>,
    );
  }

  it("renderiza as seções", async () => {
    await renderScreen();
    expect(screen.getByText("Sobre o app")).toBeTruthy();
    expect(screen.getByText("Limpar todos os dados")).toBeTruthy();
  });

  it("confirmar apaga os dados", async () => {
    await seed();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await renderScreen();
    await userEvent.setup().press(screen.getByText("Limpar todos os dados"));
    const buttons = alert.mock.calls[0][2]!;
    await buttons.find((b) => b.text === "Apagar")!.onPress!();
    await waitFor(async () => {
      const titles = (await repo.listLists()).map((l) => l.title);
      expect(titles).not.toContain("A");
      expect(titles).not.toContain("B");
    });
  });

  it("cancelar não apaga", async () => {
    await seed();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await renderScreen();
    await userEvent.setup().press(screen.getByText("Limpar todos os dados"));
    expect(await repo.listLists()).toHaveLength(2);
  });
});

