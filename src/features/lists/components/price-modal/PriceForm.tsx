import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Button, Checkbox, Chip, Icon, MoneyText } from "@/components";
import { colors, hitTarget, radius, spacing, typography } from "@/theme";
import type { ShoppingItem } from "@/types/list";
import { formatWeightG, formatWeightKg } from "@/utils/format";
import { formatBRL, parseCents } from "@/utils/money";

import { getCategoryInfo } from "../../categories";
import { itemTotalCents } from "../../totals";
import { WeightStepper } from "./WeightStepper";

const QUICK_ADD = [50, 100, 200, 500] as const;
const MAX_CENTS = 99_999_999;

export type PriceFormProps = {
  item: ShoppingItem;
  onSave: (next: { priceCents: number; quantity: number; checked: boolean }) => Promise<void>;
};

export function PriceForm({ item, onSave }: PriceFormProps) {
  const [priceCents, setPriceCents] = useState(item.unitPriceCents);
  const [quantity, setQuantity] = useState(item.quantity);
  const [checked, setChecked] = useState(item.checked);

  const isWeight = item.unit !== "un";
  const dirty =
    priceCents !== item.unitPriceCents || quantity !== item.quantity || checked !== item.checked;
  const total = itemTotalCents({ ...item, unitPriceCents: priceCents, quantity });
  const unitPrice = formatBRL(priceCents);
  const weightText = item.unit === "g" ? formatWeightG(quantity) : formatWeightKg(quantity);
  const formula = isWeight
    ? `Pesagem: ${weightText} × ${unitPrice}/kg`
    : `${quantity} un × ${unitPrice}`;

  const exit = () => {
    if (!dirty) return router.back();
    Alert.alert("Descartar alterações?", "As alterações não salvas serão perdidas.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: () => router.back() },
    ]);
  };

  const save = async () => {
    await onSave({ priceCents, quantity, checked });
    router.back();
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.tag}>{getCategoryInfo(item.category).label}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
          <Pressable
            onPress={exit}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            style={styles.close}
          >
            <Icon name="fechar" />
          </Pressable>
        </View>

        <View style={styles.display}>
          <Text style={styles.displayLabel}>VALOR TOTAL NO PACOTE</Text>
          <MoneyText cents={total} style={styles.displayValue} />
          <Text style={styles.formula}>{formula}</Text>
        </View>

        <Text style={styles.sectionLabel}>{isWeight ? "Preço por kg" : "Preço por unidade"}</Text>
        <TextInput
          value={unitPrice}
          onChangeText={(t) => setPriceCents(Math.min(parseCents(t), MAX_CENTS))}
          keyboardType="numeric"
          accessibilityLabel="Preço unitário"
          style={styles.input}
        />

        <View style={styles.rowBetween}>
          <Text style={styles.sectionLabel}>Ajuste Rápido de Centavos / Reais</Text>
          <Chip label="Zerar" onPress={() => setPriceCents(0)} />
        </View>
        <View style={styles.chips}>
          {QUICK_ADD.map((c) => (
            <Chip
              key={c}
              label={`+${formatBRL(c)}`}
              onPress={() => setPriceCents((p) => Math.min(p + c, MAX_CENTS))}
            />
          ))}
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.headerText}>
            <Text style={styles.name}>Quantidade / Peso</Text>
            <Text style={styles.hint}>
              {isWeight ? `Bandeja com ${quantity} gramas` : "Quantidade em unidades"}
            </Text>
          </View>
          <WeightStepper unit={item.unit} value={quantity} onChange={setQuantity} />
        </View>

        <View style={styles.rowBetween}>
          <Checkbox
            checked={checked}
            onChange={setChecked}
            accessibilityLabel="Marcar como pego no carrinho"
          />
          <View style={styles.headerText}>
            <Text style={styles.name}>Marcar como pego no carrinho</Text>
            <Text style={styles.hint}>Soma ao total do carrinho</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" label="Sair" onPress={exit} style={styles.footerBtn} />
        <Button label="Salvar Preço" onPress={() => void save()} style={styles.footerBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.base, gap: spacing.base },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerText: { flex: 1 },
  tag: { ...typography.labelMd, color: colors.brand },
  name: { ...typography.headlineSm, color: colors.slate },
  hint: { ...typography.bodySm, color: colors.slateMuted },
  close: {
    width: hitTarget,
    height: hitTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brandSoft,
  },
  display: {
    alignItems: "center",
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    gap: spacing.xs,
  },
  displayLabel: { ...typography.labelSm, color: colors.slateMuted },
  displayValue: { ...typography.display, color: colors.primary },
  formula: { ...typography.bodySm, color: colors.slateMuted },
  sectionLabel: { ...typography.labelMd, color: colors.slateMuted },
  input: {
    ...typography.headlineMd,
    minHeight: hitTarget,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: colors.card,
    color: colors.slate,
    paddingHorizontal: spacing.base,
    fontVariant: ["tabular-nums"],
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  footer: { flexDirection: "row", gap: spacing.md, padding: spacing.base },
  footerBtn: { flex: 1 },
});
