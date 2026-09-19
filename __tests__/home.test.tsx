import { render, screen } from "@testing-library/react-native";

import HomeScreen from "../app/index";

describe("HomeScreen", () => {
  it("mostra o título do app", async () => {
    await render(<HomeScreen />);
    expect(screen.getByText("SuperLista")).toBeTruthy();
  });
});

