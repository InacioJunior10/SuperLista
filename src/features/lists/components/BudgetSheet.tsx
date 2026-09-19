import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "@/components";
import { colors, spacing, typography } from "@/theme";
import { formatBRL, parseCents } from "@/utils/money";

import { Sheet, sheetStyles } from "./Sheet";

export type BudgetSheetProps = {
  visible: boolean;
  budgetCents?: number;
  onClose: () => void;
  /** null = remover meta. */
  onSave: (cents: number | null) => void;
};

function Form({ budgetCents, onClose, onSave }: Omit<BudgetSheetProps, "visible">) {
  const [cents, setCents] = useState(budgetCents ?? 0);
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Meta de orçamento
      </Text>
      <TextInput
        value={formatBRL(cents)}
        onChangeText={(t) => setCents(parseCents(t))}
        keyboardType="number-pad"
        accessibilityLabel="Valor da meta"
        style={[sheetStyles.input, typography.bodyLg]}
      />
      <View style={styles.row}>
        <Button label="Cancelar" variant="tertiary" onPress={onClose} style={styles.flex} />
        <Button label="Salvar" onPress={() => onSave(cents)} disabled={cents <= 0} style={styles.flex} />
      </View>
      {budgetCents ? (
        <Button label="Remover meta" variant="secondary" onPress={() => onSave(null)} />
      ) : null}
    </>
  );
}

export function BudgetSheet({ visible, ...rest }: BudgetSheetProps) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      <Form {...rest} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineSm, color: colors.slate },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
});
