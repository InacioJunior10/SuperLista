import { formatItemDetail, formatListSubtitle, formatWeightKg } from "../src/utils/format";

describe("format", () => {
  it("formata gramas em kg com 3 casas", () => {
    expect(formatWeightKg(800)).toBe("0,800 kg");
    expect(formatWeightKg(1500)).toBe("1,500 kg");
    expect(formatWeightKg(0)).toBe("0,000 kg");
  });

  it("detalhe kg com e sem preço", () => {
    expect(formatItemDetail({ unit: "kg", quantity: 800, unitPriceCents: 1025 })).toBe(
      "0,800 kg × R$ 10,25/kg",
    );
    expect(formatItemDetail({ unit: "kg", quantity: 800, unitPriceCents: 0 })).toBe("0,800 kg");
  });

  it("detalhe g: gramas, preço por kg", () => {
    expect(formatItemDetail({ unit: "g", quantity: 500, unitPriceCents: 4290 })).toBe("500 g × R$ 42,90/kg");
    expect(formatItemDetail({ unit: "g", quantity: 500, unitPriceCents: 0 })).toBe("500 g");
  });

  it("detalhe un com e sem preço", () => {
    expect(formatItemDetail({ unit: "un", quantity: 2, unitPriceCents: 0 })).toBe("2 un");
    expect(formatItemDetail({ unit: "un", quantity: 2, unitPriceCents: 499 })).toBe(
      "2 un × R$ 4,99",
    );
  });

  it("subtítulo com e sem mercado", () => {
    expect(formatListSubtitle("Pão de Açúcar")).toBe("Pão de Açúcar • Hoje");
    expect(formatListSubtitle()).toBe("Hoje");
    expect(formatListSubtitle("  ")).toBe("Hoje");
  });
});
