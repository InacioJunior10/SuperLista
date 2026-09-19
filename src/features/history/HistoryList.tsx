import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Button, Card, MoneyText } from "@/components";
import type { Purchase, PurchasesRepository, PurchaseSummary } from "@/db/purchases";
import { paymentLabel } from "@/features/checkout/paymentMethods";
import { colors, hitTarget, radius, sizes, spacing, typography } from "@/theme";
import { formatItemDetail } from "@/utils/format";

import { buildPriceChart, formatPurchaseDate, type ChartBar } from "./chart";

export type HistoryListProps = {
  getRepo: () => Promise<PurchasesRepository>;
  /** Muda para recarregar (ex.: aba ganhou foco). */
  refreshToken?: number;
};

const CHART_MAX_HEIGHT = sizes.iconLg * 5;

export function HistoryList({ getRepo, refreshToken = 0 }: HistoryListProps) {
  const [purchases, setPurchases] = useState<PurchaseSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Purchase | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [bars, setBars] = useState<ChartBar[]>([]);

  const load = useCallback(async () => {
    try {
      const repo = await getRepo();
      setPurchases(await repo.listPurchases());
      setError(false);
    } catch {
      setError(true);
    }
  }, [getRepo]);

  useEffect(() => {
    let active = true;
    getRepo()
      .then((repo) => repo.listPurchases())
      .then((list) => {
        if (!active) return;
        setPurchases(list);
        setError(false);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [getRepo, refreshToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggle = async (id: string) => {
    setSelected(null);
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    try {
      setDetail(await (await getRepo()).getPurchase(id));
    } catch {
      setError(true);
    }
  };

  const select = async (name: string) => {
    setSelected(name);
    try {
      const points = await (await getRepo()).priceHistory(name);
      setBars(buildPriceChart(points));
    } catch {
      setError(true);
    }
  };

  if (error && !purchases) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Não foi possível carregar o histórico.</Text>
        <Button label="Tentar novamente" onPress={() => void load()} />
      </View>
    );
  }
  if (!purchases) {
    return (
      <View style={styles.center} accessibilityLabel="Carregando histórico">
        <ActivityIndicator color={colors.brand} />
        <Text style={styles.message}>Carregando...</Text>
      </View>
    );
  }
  if (purchases.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Nenhuma compra finalizada ainda. Finalize uma compra na aba Carrinho.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={purchases}
      keyExtractor={(p) => p.id}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
      renderItem={({ item: p }) => {
        const open = openId === p.id;
        const hasGoal = p.budgetCents !== undefined && p.budgetCents > 0;
        const within = hasGoal && p.totalCents <= (p.budgetCents ?? 0);
        return (
          <Card style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Compra de ${formatPurchaseDate(p.createdAt)}, ${p.market ?? p.title}`}
              accessibilityState={{ expanded: open }}
              onPress={() => void toggle(p.id)}
              style={styles.cardHead}
            >
              <View style={styles.flex}>
                <Text style={styles.label}>{formatPurchaseDate(p.createdAt)}</Text>
                <Text style={styles.title}>{p.market ?? p.title}</Text>
                <Text style={styles.label}>
                  {p.itemCount} {p.itemCount === 1 ? "item" : "itens"} • {paymentLabel(p.paymentMethod)}
                </Text>
                {hasGoal && (
                  <Text style={[styles.label, { color: within ? colors.brand : colors.danger }]}>
                    {within ? "Dentro da meta" : "Acima da meta"}
                  </Text>
                )}
              </View>
              <MoneyText cents={p.totalCents} />
            </Pressable>
            {open && (
              <View style={styles.detail}>
                {!detail && <Text style={styles.label}>Carregando...</Text>}
                {detail?.items.map((i) => (
                  <Pressable
                    key={i.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver evolução do preço de ${i.name}`}
                    onPress={() => void select(i.name)}
                    style={styles.itemRow}
                  >
                    <View style={styles.flex}>
                      <Text style={styles.title}>{i.name}</Text>
                      <Text style={styles.label}>{formatItemDetail(i)}</Text>
                    </View>
                    <MoneyText cents={i.totalCents} style={styles.itemTotal} />
                  </Pressable>
                ))}
                {selected && (
                  <View style={styles.chart}>
                    <Text style={styles.title}>Evolução do preço — {selected}</Text>
                    {bars.length === 1 && <Text style={styles.label}>Só há uma compra deste produto ainda.</Text>}
                    <View style={styles.bars}>
                      {bars.map((b, idx) => (
                        <View key={idx} style={styles.barCol}>
                          <Text style={styles.barValue}>{`${b.valueLabel}`}</Text>
                          <View
                            style={[
                              styles.bar,
                              {
                                height: Math.max(1, Math.round(b.ratio * CHART_MAX_HEIGHT)),
                                backgroundColor: idx === bars.length - 1 ? colors.brand : colors.outlineVariant,
                              },
                            ]}
                          />
                          <Text style={styles.label}>{b.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.base },
  message: { ...typography.bodyLg, color: colors.slateMuted, textAlign: "center" },
  list: { gap: spacing.md, paddingTop: spacing.base, paddingBottom: spacing.xl },
  card: { padding: 0, overflow: "hidden" },
  cardHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.base, minHeight: hitTarget },
  title: { ...typography.labelLg, color: colors.slate },
  label: { ...typography.bodySm, color: colors.slateMuted },
  detail: { borderTopWidth: 1, borderTopColor: colors.stroke, padding: spacing.base, gap: spacing.sm },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: hitTarget },
  itemTotal: { ...typography.labelLg },
  chart: { backgroundColor: colors.brandSoft, borderRadius: radius.md, padding: spacing.base, gap: spacing.sm },
  bars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", gap: spacing.xs },
  barCol: { alignItems: "center", justifyContent: "flex-end", flex: 1, gap: spacing.xs },
  bar: { width: sizes.iconLg, borderRadius: radius.sm },
  barValue: { ...typography.labelSm, color: colors.slate },
});


