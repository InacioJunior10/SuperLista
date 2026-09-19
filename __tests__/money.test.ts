import { formatBRL, parseCents, priceByWeight } from "../src/utils/money";

describe("money", () => {
  it("formata centavos em R$", () => {
    expect(formatBRL(16886)).toBe("R$ 168,86");
    expect(formatBRL(0)).toBe("R$ 0,00");
  });

  it("aplica máscara de digitação", () => {
    expect(parseCents("R$ 8,20")).toBe(820);
    expect(parseCents("")).toBe(0);
  });

  it("calcula preço por peso", () => {
    expect(priceByWeight(1025, 800)).toBe(820);
  });
});
