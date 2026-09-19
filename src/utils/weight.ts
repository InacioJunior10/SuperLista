/** Passo do stepper de peso: 50 g. */
export const STEP_GRAMS = 50;

export function gramsToKg(grams: number): number {
  return grams / 1000;
}

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

/** 800 -> "0,8 kg"; 1050 -> "1,05 kg" */
export function formatKgShort(grams: number): string {
  return `${String(gramsToKg(grams)).replace(".", ",")} kg`;
}

/** Peso (kg/g) guarda gramas; un/pct guardam contagem. */
const isWeightUnit = (u: string) => u === "kg" || u === "g";

/** Converte a quantidade ao trocar a unidade: kg↔g e un↔pct mantêm; peso→contagem 1; contagem→kg 1000; contagem→g 100. */
export function convertQuantity(from: string, to: string, quantity: number): number {
  const fromWeight = isWeightUnit(from);
  if (isWeightUnit(to)) return fromWeight ? quantity : to === "kg" ? 1000 : 100;
  return fromWeight ? 1 : quantity;
}
