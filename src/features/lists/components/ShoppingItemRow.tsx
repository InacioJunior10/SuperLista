import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Checkbox, PriceBadge } from "@/components";
import { itemTotalCents } from "@/features/lists/totals";
import { colors, hitTarget, radius, spacing, typography } from "@/theme";
import type { ShoppingItem } from "@/types/list";
import { formatItemDetail } from "@/utils/format";

export type ShoppingItemRowProps = {
  item: ShoppingItem;
  /** Deve ser estável (useCallback) para o memo funcionar. */
  onToggle: (itemId: string) => void;
  /** Abre o modal de preço (toque na linha, fora do checkbox). */
  onOpen: (itemId: string) => void;
  /** Pressionar e segurar: editar/remover. */
  onLongPress?: (itemId: string) => void;
};

function ShoppingItemRowBase({ item, onToggle, onOpen, onLongPress }: ShoppingItemRowProps) {
  const detail = formatItemDetail(item);
  const done = item.checked;
  return (
    <View style={styles.row}>
      <Checkbox
        checked={done}
        onChange={() => onToggle(item.id)}
        accessibilityLabel={`Marcar ${item.name} como pego no carrinho`}
      />
      <Pressable
        onPress={() => onOpen(item.id)}
        onLongPress={() => onLongPress?.(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${detail}. Editar preço`}
        style={styles.content}
      >
        <View style={styles.texts}>
          <Text numberOfLines={1} style={[styles.name, done && styles.done]}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={[styles.detail, done && styles.done]}>
            {detail}
          </Text>
        </View>
        <PriceBadge cents={itemTotalCents(item)} onPress={() => onOpen(item.id)} />
      </Pressable>
    </View>
  );
}

export const ShoppingItemRow = memo(ShoppingItemRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
  },
  content: {
    flex: 1,
    minHeight: hitTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  texts: { flex: 1 },
  name: { ...typography.bodyLg, color: colors.slate },
  detail: { ...typography.bodyMd, color: colors.slateMuted },
  done: { color: colors.slateMuted, textDecorationLine: "line-through" },
});
