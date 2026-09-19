import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";

import { migrate } from "@/db/migrations";
import { createProductsRepository } from "@/db/products";
import { AddItemSheet } from "@/features/lists/components/AddItemSheet";

import { createTestDb } from "../test-utils/sqliteTestDb";

let mockPermission: { granted: boolean; canAskAgain: boolean } | null = { granted: true, canAskAgain: true };
const mockRequest = jest.fn();
let mockScan: ((e: { data: string }) => void) | undefined;

jest.mock("expo-camera", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    CameraView: (props: { onBarcodeScanned: (e: { data: string }) => void }) => {
      mockScan = props.onBarcodeScanned;
      return <View testID="camera" />;
    },
    useCameraPermissions: () => [mockPermission, mockRequest],
  };
});

const mockGetByEan = jest.fn();
const mockUpsert = jest.fn();
jest.mock("@/db/products-client", () => ({
  getProductsRepository: () => Promise.resolve({ getByEan: mockGetByEan, upsert: mockUpsert }),
}));

describe("repositório de produtos", () => {
  it("migração v4, upsert, getByEan e unit inválida", async () => {
    const db = createTestDb();
    await migrate(db);
    const repo = createProductsRepository(db);
    expect(await repo.getByEan("1")).toBeNull();
    await repo.upsert({ ean: "1", name: "Leite", category: "laticinios", unit: "un" });
    const p = await repo.upsert({ ean: "1", name: "Leite Integral", category: "laticinios", unit: "un" });
    expect(p.name).toBe("Leite Integral");
    expect(await repo.getByEan("1")).toEqual(p);
    await expect(
      db.runAsync("INSERT INTO products (ean, name, unit, updated_at) VALUES ('2','x','l','t')"),
    ).rejects.toThrow();
    db.close();
  });
});

describe("scanner no AddItemSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermission = { granted: true, canAskAgain: true };
  });

  const open = async (item?: Parameters<typeof AddItemSheet>[0]["item"]) => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    await render(<AddItemSheet visible item={item} onClose={onClose} onSubmit={onSubmit} />);
    return { onSubmit, user: userEvent.setup() };
  };

  it("botão só no modo novo item", async () => {
    await open();
    expect(screen.getByRole("button", { name: "Escanear código" })).toBeTruthy();
  });

  it("não aparece no modo edição", async () => {
    await open({
      id: "i", name: "Arroz", category: "outros", unit: "un", quantity: 1, unitPriceCents: 0, checked: false,
    } as never);
    expect(screen.queryByRole("button", { name: "Escanear código" })).toBeNull();
  });

  it("EAN conhecido preenche o sheet", async () => {
    mockGetByEan.mockResolvedValue({ ean: "789", name: "Queijo", category: "laticinios", unit: "kg" });
    const { user } = await open();
    await user.press(screen.getByRole("button", { name: "Escanear código" }));
    await act(async () => mockScan?.({ data: "789" }));
    expect(await screen.findByDisplayValue("Queijo")).toBeTruthy();
    expect(screen.queryByText("Produto novo: preencha o nome")).toBeNull();
  });

  it("EAN desconhecido avisa e faz upsert ao adicionar", async () => {
    mockGetByEan.mockResolvedValue(null);
    const { user, onSubmit } = await open();
    await user.press(screen.getByRole("button", { name: "Escanear código" }));
    await act(async () => mockScan?.({ data: "555" }));
    expect(await screen.findByText("Produto novo: preencha o nome")).toBeTruthy();
    await user.type(screen.getByLabelText("Nome do item"), "Pão");
    await user.press(screen.getByRole("button", { name: "Adicionar" }));
    expect(onSubmit).toHaveBeenCalled();
    await waitFor(() =>
      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ ean: "555", name: "Pão" })),
    );
  });

  it("permissão negada mostra texto e botão", async () => {
    mockPermission = { granted: false, canAskAgain: true };
    const { user } = await open();
    await user.press(screen.getByRole("button", { name: "Escanear código" }));
    expect(screen.getByText("Precisamos da câmera para ler códigos de barras.")).toBeTruthy();
    await user.press(screen.getByRole("button", { name: "Permitir câmera" }));
    expect(mockRequest).toHaveBeenCalled();
  });

  it("cancelar fecha sem alterar", async () => {
    const { user } = await open();
    await user.press(screen.getByRole("button", { name: "Escanear código" }));
    await user.press(screen.getAllByRole("button", { name: "Cancelar" })[0]);
    expect(screen.queryByTestId("camera")).toBeNull();
    expect(screen.getByLabelText("Nome do item").props.value).toBe("");
  });
});
