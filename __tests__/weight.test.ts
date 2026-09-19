import { formatKgShort, gramsToKg, kgToGrams, STEP_GRAMS } from "@/utils/weight";

describe("weight", () => {
  it("converte gramas <-> kg", () => {
    expect(gramsToKg(800)).toBe(0.8);
    expect(kgToGrams(0.85)).toBe(850);
    expect(kgToGrams(0.1 + 0.2)).toBe(300);
    expect(STEP_GRAMS).toBe(50);
  });
  it("formata kg curto", () => {
    expect(formatKgShort(800)).toBe("0,8 kg");
    expect(formatKgShort(1050)).toBe("1,05 kg");
    expect(formatKgShort(2000)).toBe("2 kg");
  });
});
