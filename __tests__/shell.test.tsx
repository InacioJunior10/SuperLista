import { render, screen, userEvent } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";

import { DatabaseGate } from "@/features/lists/DatabaseGate";

import TabsLayout from "../app/(tabs)/_layout";
import Ajustes from "../app/(tabs)/ajustes";
import Carrinho from "../app/(tabs)/carrinho";
import Historico from "../app/(tabs)/historico";
import Home from "../app/(tabs)/index";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("abas", () => {
  it("renderiza os 4 rótulos do PRD", async () => {
    await renderRouter({
      "(tabs)/_layout": TabsLayout,
      "(tabs)/index": Home,
      "(tabs)/historico": Historico,
      "(tabs)/carrinho": Carrinho,
      "(tabs)/ajustes": Ajustes,
    });
    for (const label of ["Lista", "Histórico", "Carrinho", "Ajustes"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});

describe("DatabaseGate", () => {
  it("mostra erro e permite tentar novamente", async () => {
    const repo = {} as never;
    const load = jest.fn().mockRejectedValueOnce(new Error("falha")).mockResolvedValue(repo);
    const onSettled = jest.fn();
    await render(
      <DatabaseGate loadRepository={load} onSettled={onSettled}>
        {null}
      </DatabaseGate>,
    );
    const retry = await screen.findByText("Tentar novamente");
    expect(onSettled).toHaveBeenCalled();
    await userEvent.setup().press(retry);
    await screen.findAllByText("", { exact: false }).catch(() => undefined);
    expect(load).toHaveBeenCalledTimes(2);
  });
});