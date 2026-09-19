import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card, Chip, MoneyText, ScreenContainer } from "@/components";
import type { PaymentMethod } from "@/db/purchases";
import { PAYMENT_METHODS } from "@/features/checkout/paymentMethods";
import { buildReceipt } from "@/features/checkout/receipt";
import { itemTotalCents } from "@/features/lists/totals";
import { useShoppingList } from "@/features/lists/ListsProvider";
import { colors, spacing, typography } from "@/theme";
import { formatItemDetail } from "@/utils/format";
import { formatBRL } from "@/utils/money";

export default function CarrinhoScreen() {
  const { list, removeItem } = useShoppingList();
  const [payment, setPayment] = useState<PaymentMethod>("dinheiro");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const receipt = buildReceipt(list ?? { items: [] });
  const empty = receipt.itemCount === 0;
  const { budget } = receipt;

  const finalize = async () => {
    if (!list || busy) return;
    setBusy(true);
    setError(null);
    try {
      const picked = list.items.filter((i) => i.checked);
      // require lazy: evita carregar expo-sqlite até a ação (e nos testes de shell)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getPurchasesRepository } = require("@/db/purchases-client") as typeof import("@/db/purchases-client");
      const repo = await getPurchasesRepository();
      await repo.create({
        title: list.title,
        market: list.market,
        budgetCents: list.budgetCents,
        paymentMethod: payment,
        items: picked.map((i) => ({
          name: i.name,
          category: i.category,
          unit: i.unit,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          totalCents: itemTotalCents(i),
        })),
      });
      for (const item of picked) await removeItem(item.id);
      Alert.alert("Compra finalizada", "Sua compra foi salva no histórico.");
    } catch {
      setError("Não foi possível finalizar a compra. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = () =>
    Alert.alert("Finalizar compra?", "Os itens pegos serão removidos da lista.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Finalizar", onPress: () => void finalize() },
    ]);

  return (
    <ScreenContainer>
      <Text accessibilityRole="header" style={styles.title}>
        Carrinho
      </Text>
      {empty ? (
        <Text style={styles.body}>Nenhum item pego ainda. Marque os itens na aba Lista.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {receipt.sections.map((s) => (
            <Card key={s.category.key} style={styles.card}>
              <Text style={styles.section}>{s.category.label}</Text>
              {s.lines.map((l) => (
                <View key={l.item.id} style={styles.row}>
                  <View style={styles.flex}>
                    <Text style={styles.name}>{l.item.name}</Text>
                    <Text style={styles.body}>{formatItemDetail(l.item)}</Text>
                  </View>
                  <Text style={styles.name}>{formatBRL(l.totalCents)}</Text>
                </View>
              ))}
              <Text style={styles.subtotal}>Subtotal: {formatBRL(s.subtotalCents)}</Text>
            </Card>
          ))}
          <Card style={styles.card}>
            <Text style={styles.section}>Total do carrinho</Text>
            <MoneyText cents={receipt.totalCents} />
            {budget.level === "within" ? (
              <Text style={[styles.body, { color: colors.brand }]}>
                Dentro da meta: sobram {formatBRL(budget.diffCents)}
              </Text>
            ) : null}
            {budget.level === "over" ? (
              <Text style={[styles.body, { color: colors.danger }]}>
                Acima da meta em {formatBRL(-budget.diffCents)}
              </Text>
            ) : null}
          </Card>
          <Text style={styles.section}>Forma de pagamento</Text>
          <View style={styles.chips}>
            {PAYMENT_METHODS.map((m) => (
              <Chip key={m.key} label={m.label} active={payment === m.key} onPress={() => setPayment(m.key)} />
            ))}
          </View>
        </ScrollView>
      )}
      {error ? <Text style={[styles.body, { color: colors.danger }]}>{error}</Text> : null}
      <Button label="Finalizar Compra" disabled={empty || busy} onPress={confirm} style={styles.cta} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineLgMobile, color: colors.slate, marginVertical: spacing.base },
  card: { marginBottom: spacing.base, gap: spacing.sm },
  section: { ...typography.headlineSm, color: colors.slate },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
  name: { ...typography.labelLg, color: colors.slate },
  body: { ...typography.bodyMd, color: colors.slateMuted },
  subtotal: { ...typography.labelLg, color: colors.slateMuted, textAlign: "right" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.sm },
  cta: { marginTop: spacing.base },
});
