import { suggestCategory } from "@/features/lists/suggestCategory";

describe("suggestCategory", () => {
  it.each([
    ["Tomate", "hortifruti"],
    ["banana prata", "hortifruti"],
    ["Maçã", "hortifruti"],
    ["Leite integral", "laticinios"],
    ["queijo", "laticinios"],
    ["Iogurte", "laticinios"],
    ["Pão francês", "padaria"],
    ["Frango", "carnes"],
    ["carne moída", "carnes"],
    ["Detergente", "limpeza"],
    ["sabão em pó", "limpeza"],
    ["Arroz", "mercearia"],
    ["Feijão", "mercearia"],
    ["Óleo de soja", "mercearia"],
    ["Pacotes de macarrão", "mercearia"],
    ["Molho de tomate", "mercearia"],
    ["Sabonete", "limpeza"],
    ["Desodorante", "limpeza"],
    ["Condicionador", "limpeza"],
    ["Creme dental", "limpeza"],
  ])("%s => %s", (name, cat) => expect(suggestCategory(name)).toBe(cat));

  it("retorna null sem correspondência", () => {
    expect(suggestCategory("xyz")).toBeNull();
    expect(suggestCategory("  ")).toBeNull();
  });
});
