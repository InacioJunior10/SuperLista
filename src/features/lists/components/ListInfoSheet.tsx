import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "@/components";
import { colors, spacing, typography } from "@/theme";

import { Sheet, sheetStyles } from "./Sheet";

export type ListInfoSheetProps = {
  visible: boolean;
  title: string;
  market?: string;
  onClose: () => void;
  onSave: (info: { title: string; market: string }) => void;
};

function Form({ title, market, onClose, onSave }: Omit<ListInfoSheetProps, "visible">) {
  const [t, setT] = useState(title);
  const [m, setM] = useState(market ?? "");
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Editar lista
      </Text>
      <TextInput
        value={t}
        onChangeText={setT}
        placeholder="Título da lista"
        accessibilityLabel="Título da lista"
        style={[sheetStyles.input, typography.bodyLg]}
      />
      <TextInput
        value={m}
        onChangeText={setM}
        placeholder="Mercado (opcional)"
        accessibilityLabel="Mercado"
        style={[sheetStyles.input, typography.bodyLg]}
      />
      <View style={styles.row}>
        <Button label="Cancelar" variant="tertiary" onPress={onClose} style={styles.flex} />
        <Button
          label="Salvar"
          onPress={() => onSave({ title: t.trim(), market: m.trim() })}
          disabled={t.trim() === ""}
          style={styles.flex}
        />
      </View>
    </>
  );
}

export function ListInfoSheet({ visible, ...rest }: ListInfoSheetProps) {
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
