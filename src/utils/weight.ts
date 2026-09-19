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
