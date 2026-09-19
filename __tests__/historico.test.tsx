import { render, screen, userEvent } from "@testing-library/react-native";

import { migrate } from "@/db/migrations";
import { createPurchasesRepository, type PurchasesRepository } from "@/db/purchases";
import { buildPriceChart, formatPurchaseDate, formatShortDate } from "@/features/history/chart";
import { HistoryList } from "@/features/history/HistoryList";

import { createTestDb } from "../test-utils/sqliteTestDb";

const iso = (d: number) => new Date(2026, 8, d, 12).toISOString();

describe("chart", () => {
  it("formata datas", () => {
    expect(formatPurchaseDate(iso(19))).toBe("19/09/2026");
    expect(formatShortDate(iso(5))).toBe("05/09");
  });
  it("proporções, 1 ponto e limite 8", () => {
    const pts = [1, 2, 3].map((d, i) => ({ createdAt: iso(d), unit: "kg" as const, unitPriceCents: (i + 1) * 100 }));
    const bars = buildPriceChart(pts);
    expect(bars.map((b) => b.ratio)).toEqual([1 / 3, 2 / 3, 1]);
    expect(bars[2].valueLabel).toBe("R$ 3,00/kg");
    expect(buildPriceChart(pts.slice(0, 1))).toHaveLength(1);
    const many = Array.from({ length: 12 }, (_, i) => ({ createdAt: iso(i + 1), unit: "un" as const, unitPriceCents: 100 + i }));
    const b = buildPriceChart(many);
    expect(b).toHaveLength(8);
    expect(b[0].cents).toBe(104);
  });
});

describe("HistoryList", () => {
  let db: ReturnType<typeof createTestDb>;
  let repo: PurchasesRepository;
  beforeEach(async () => {
    db = createTestDb();
    await migrate(db);
    repo = createPurchasesRepository(db);
  });
  afterEach(() => db.close());

  const line = (name: string, cents: number) => ({
    name, category: "outros" as const, unit: "un" as const, quantity: 2, unitPriceCents: cents, totalCents: cents * 2,
  });

  it("vazio", async () => {
    await render(<HistoryList getRepo={async () => repo} />);
    expect(await screen.findByText(/Nenhuma compra finalizada ainda/)).toBeTruthy();
  });

  it("erro com Tentar novamente", async () => {
    const getRepo = jest.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(repo);
    await render(<HistoryList getRepo={getRepo} />);
    await userEvent.press(await screen.findByText("Tentar novamente"));
    expect(await screen.findByText(/Nenhuma compra finalizada/)).toBeTruthy();
  });

  it("lista, expande e mostra o gráfico", async () => {
    await repo.create({ title: "Velha", market: "Mercado A", paymentMethod: "dinheiro", items: [line("Arroz", 500)] });
    await repo.create({ title: "Nova", market: "Mercado B", budgetCents: 1000, paymentMethod: "credito", items: [line("Arroz", 600), line("Feijão", 300)] });
    await render(<HistoryList getRepo={async () => repo} />);
    const titles = await screen.findAllByText(/Mercado [AB]/);
    expect(titles.map((t) => t.props.children)).toEqual(["Mercado B", "Mercado A"]);
    expect(screen.getByText("2 itens • Crédito")).toBeTruthy();
    expect(screen.getByText("Acima da meta")).toBeTruthy();
    expect(screen.getByText("R$ 18,00")).toBeTruthy();

    await userEvent.press(screen.getByLabelText(/Mercado B/));
    expect(await screen.findByText("Feijão")).toBeTruthy();
    await userEvent.press(screen.getByLabelText("Ver evolução do preço de Feijão"));
    expect(await screen.findByText("Evolução do preço — Feijão")).toBeTruthy();
    expect(screen.getByText("Só há uma compra deste produto ainda.")).toBeTruthy();

    await userEvent.press(screen.getByLabelText("Ver evolução do preço de Arroz"));
    expect(await screen.findByText("Evolução do preço — Arroz")).toBeTruthy();
    expect(screen.getByText("R$ 5,00/un")).toBeTruthy();
    expect(screen.getByText("R$ 6,00/un")).toBeTruthy();
  });
});

