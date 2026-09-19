import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Checkbox, Icon, PriceBadge } from "@/components";
import { itemTotalCents } from "@/features/lists/totals";
import {
  colors,
  elevation,
  fontFamily,
  hitTarget,
  radius,
  sizes,
  spacing,
  typography,
} from "@/theme";
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
  /** Lixeira: pede confirmação e exclui. */
  onDelete?: (itemId: string) => void;
};

function ShoppingItemRowBase({
  item,
  onToggle,
  onOpen,
  onLongPress,
  onDelete,
}: ShoppingItemRowProps) {
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
          <Text numberOfLines={2} style={[styles.name, done && styles.done]}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={[styles.detail, done && styles.detailDone]}>
            {detail}
          </Text>
        </View>
        <PriceBadge cents={itemTotalCents(item)} onPress={() => onOpen(item.id)} />
      </Pressable>
      <Pressable
        onPress={() => onDelete?.(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Excluir ${item.name}`}
        style={styles.trash}
      >
        <Icon name="excluir" size={sizes.iconMd} color={colors.danger} />
      </Pressable>
    </View>
  );
}

export const ShoppingItemRow = memo(ShoppingItemRowBase);

const styles = StyleSheet.create({
  row: {
    ...elevation.level1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  content: {
    flex: 1,
    minHeight: hitTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  texts: { flex: 1 },
  name: { ...typography.bodyLg, fontFamily: fontFamily.semibold, color: colors.onSurface },
  detail: { ...typography.bodySm, color: colors.onSurfaceVariant },
  done: {
    fontFamily: fontFamily.medium,
    color: colors.onSurfaceVariant,
    textDecorationLine: "line-through",
  },
  detailDone: { color: colors.outline },
  trash: { width: hitTarget, height: hitTarget, alignItems: "center", justifyContent: "center" },
});
