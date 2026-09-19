import type { PriceHistoryPoint } from "@/db/purchases";
import { formatBRL } from "@/utils/money";

export const MAX_CHART_POINTS = 8;

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO -> "19/09/2026" (fuso local). */
export function formatPurchaseDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** ISO -> "19/09". */
export function formatShortDate(iso: string): string {
  return formatPurchaseDate(iso).slice(0, 5);
}

export type ChartBar = { label: string; cents: number; ratio: number; valueLabel: string };

/** Últimas 8 compras (mais antiga -> mais nova); ratio = preço / maior preço. */
export function buildPriceChart(points: PriceHistoryPoint[]): ChartBar[] {
  const last = points.slice(-MAX_CHART_POINTS);
  const max = Math.max(0, ...last.map((p) => p.unitPriceCents));
  return last.map((p) => ({
    label: formatShortDate(p.createdAt),
    cents: p.unitPriceCents,
    ratio: max > 0 ? p.unitPriceCents / max : 0,
    valueLabel: `${formatBRL(p.unitPriceCents)}/${p.unit}`,
  }));
}
