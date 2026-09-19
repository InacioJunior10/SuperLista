import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Button, Chip } from "@/components";
import type { NewItem } from "@/db/repository";
import { CATEGORIES } from "@/features/lists/categories";
import { suggestCategory } from "@/features/lists/suggestCategory";
import { lookupProduct, rememberProduct } from "@/features/scanner/lookup";
import { ScannerModal } from "@/features/scanner/ScannerModal";
import { colors, hitTarget, radius, spacing, typography } from "@/theme";
import type { Category, ShoppingItem, Unit } from "@/types/list";

import { Sheet, sheetStyles } from "./Sheet";

export type AddItemSheetProps = {
  visible: boolean;
  /** Presente = modo edição. */
  item?: ShoppingItem;
  onClose: () => void;
  onSubmit: (input: NewItem) => void;
};

const DEFAULT_GRAMS = 100;

/** Quantidade inicial do campo ao escolher a unidade: un 1, kg 1, g 100. */
const defaultQtyText = (unit: Unit) => (unit === "g" ? String(DEFAULT_GRAMS) : "1");

const UNIT_CHIPS = [
  { unit: "un", label: "Unidade" },
  { unit: "kg", label: "Kg" },
  { unit: "g", label: "Gramas" },
] as const;

/** un: inteiro >= 1; g: gramas inteiros (padrão 100); kg: "0,8" -> 800 (gramas). */
export function parseQuantity(text: string, unit: Unit): number {
  if (unit === "g") return Math.max(1, parseInt(text.replace(/\D/g, ""), 10) || DEFAULT_GRAMS);
  if (unit === "un") return Math.max(1, parseInt(text.replace(/\D/g, ""), 10) || 1);
  const kg = parseFloat(text.replace(",", "."));
  return Number.isFinite(kg) && kg > 0 ? Math.max(1, Math.round(kg * 1000)) : 1000;
}

const quantityText = (item?: ShoppingItem) =>
  !item ? "1" : item.unit === "kg" ? String(item.quantity / 1000).replace(".", ",") : String(item.quantity);

function Form({ item, onClose, onSubmit }: Omit<AddItemSheetProps, "visible">) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<Category>(item?.category ?? "outros");
  const [touched, setTouched] = useState(!!item);
  const [unit, setUnit] = useState<Unit>(item?.unit ?? "un");
  const [qty, setQty] = useState(quantityText(item));

  const onName = (text: string) => {
    setName(text);
    if (!touched) setCategory(suggestCategory(text) ?? "outros");
  };
  const [scanning, setScanning] = useState(false);
  const [ean, setEan] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const onScanned = async (code: string) => {
    setScanning(false);
    const found = await lookupProduct(code);
    setEan(code);
    setIsNew(!found);
    if (!found) return;
    setName(found.name);
    setCategory(CATEGORIES.some((c) => c.key === found.category) ? (found.category as Category) : "outros");
    setUnit(found.unit);
    setQty(defaultQtyText(found.unit));
    setTouched(true);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (ean) void rememberProduct({ ean, name: trimmed, category, unit });
    onSubmit({ name: trimmed, category, unit, quantity: parseQuantity(qty, unit) });
  };

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        {item ? "Editar item" : "Novo item"}
      </Text>
      {!item && (
        <Pressable
          onPress={() => setScanning(true)}
          accessibilityRole="button"
          accessibilityLabel="Escanear código"
          style={styles.scan}
        >
          <MaterialCommunityIcons
            name="barcode-scan"
            size={24}
            color={colors.primary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={styles.scanText}>Escanear código</Text>
        </Pressable>
      )}
      {isNew && <Text style={styles.notice}>Produto novo: preencha o nome</Text>}
      <ScannerModal visible={scanning} onClose={() => setScanning(false)} onScanned={onScanned} />
      <TextInput
        value={name}
        onChangeText={onName}
        placeholder="Nome do item"
        accessibilityLabel="Nome do item"
        style={[sheetStyles.input, typography.bodyLg]}
      />
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.row}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            label={c.chipLabel}
            active={category === c.key}
            onPress={() => {
              setCategory(c.key);
              setTouched(true);
            }}
          />
        ))}
      </View>
      <Text style={styles.label}>Unidade</Text>
      <View style={styles.row}>
        {UNIT_CHIPS.map((c) => (
          <Chip
            key={c.unit}
            label={c.label}
            active={unit === c.unit}
            accessibilityLabel={`Unidade ${c.unit}`}
            onPress={() => {
              if (c.unit === unit) return;
              setUnit(c.unit);
              setQty(defaultQtyText(c.unit));
            }}
          />
        ))}
      </View>
      <Text style={styles.label}>{unit === "kg" ? "Quantidade (kg)" : unit === "g" ? "Quantidade (g)" : "Quantidade"}</Text>
      <TextInput
        value={qty}
        onChangeText={setQty}
        keyboardType={unit === "kg" ? "decimal-pad" : "number-pad"}
        accessibilityLabel="Quantidade"
        style={[sheetStyles.input, typography.bodyLg]}
      />
      <View style={styles.row}>
        <Button label="Cancelar" variant="tertiary" onPress={onClose} style={styles.flex} />
        <Button
          label={item ? "Salvar" : "Adicionar"}
          onPress={submit}
          disabled={name.trim() === ""}
          style={styles.flex}
        />
      </View>
    </>
  );
}

export function AddItemSheet({ visible, item, onClose, onSubmit }: AddItemSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Form item={item} onClose={onClose} onSubmit={onSubmit} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineSm, color: colors.slate },
  label: { ...typography.labelLg, color: colors.slateMuted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  flex: { flex: 1 },
  scan: {
    minHeight: hitTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.base,
  },
  scanText: { ...typography.labelLg, color: colors.primary },
  notice: { ...typography.labelLg, color: colors.slateMuted },
});
