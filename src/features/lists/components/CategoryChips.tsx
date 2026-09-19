import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { Chip } from "@/components";
import { CATEGORIES } from "@/features/lists/categories";
import { spacing } from "@/theme";
import type { Category } from "@/types/list";

export type CategoryChipsProps = {
  /** Categorias que têm ao menos um item. */
  available: readonly Category[];
  selected: Category | null;
  onSelect: (category: Category | null) => void;
};

export function CategoryChips({ available, selected, onSelect }: CategoryChipsProps) {
  const chips = useMemo(() => CATEGORIES.filter((c) => available.includes(c.key)), [available]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      <Chip label="Todos" active={selected === null} onPress={() => onSelect(null)} />
      {chips.map((c) => (
        <Chip
          key={c.key}
          label={c.chipLabel}
          active={selected === c.key}
          onPress={() => onSelect(c.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  content: { gap: spacing.sm, paddingVertical: spacing.md },
});
