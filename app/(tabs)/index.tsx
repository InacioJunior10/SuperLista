import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, SectionList, StyleSheet } from "react-native";

import { ScreenContainer } from "@/components";
import {
  BudgetHero,
  CategoryChips,
  CategorySectionHeader,
  EmptyState,
  ListError,
  ListHeader,
  ListLoading,
  ListTip,
  ShoppingItemRow,
} from "@/features/lists/components";
import { groupByCategory } from "@/features/lists/grouping";
import { useShoppingList } from "@/features/lists/ListsProvider";
import { spacing } from "@/theme";
import type { Category, ShoppingItem } from "@/types/list";

// TODO fase 6: abrir o formulário de novo item. Por ora, apenas avisa.
const handleAddItem = () => Alert.alert("Em breve", "O cadastro de itens chega na próxima versão.");

export default function ListaScreen() {
  const api = useShoppingList();
  const { list, loading, error, items } = { ...api, items: api.list?.items };
  const [filter, setFilter] = useState<Category | null>(null);

  // Callbacks estáveis: leem sempre a API mais recente, para as linhas (memo) não re-renderizarem.
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  });
  const onToggle = useCallback((id: string) => void apiRef.current.toggleItem(id), []);
  const onOpen = useCallback(
    (itemId: string) => router.push({ pathname: "/preco/[itemId]", params: { itemId } }),
    [],
  );
  const onRetry = useCallback(() => void apiRef.current.reload(), []);
  const onRecalculate = useCallback(() => {
    Alert.alert("Recalcular lista", "Desmarcar todos os itens já pegos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Recalcular",
        style: "destructive",
        onPress: () => void apiRef.current.resetChecks(),
      },
    ]);
  }, []);

  const available = useMemo(() => [...new Set((items ?? []).map((i) => i.category))], [items]);
  const activeFilter = filter && available.includes(filter) ? filter : null;
  const sections = useMemo(
    () => groupByCategory(items ?? [], activeFilter).map((s) => ({ ...s, data: s.items })),
    [items, activeFilter],
  );

  const renderItem = useCallback(
    ({ item }: { item: ShoppingItem }) => (
      <ShoppingItemRow item={item} onToggle={onToggle} onOpen={onOpen} />
    ),
    [onToggle, onOpen],
  );
  const renderSectionHeader = useCallback(
    ({ section }: { section: (typeof sections)[number] }) => (
      <CategorySectionHeader section={section} />
    ),
    [],
  );

  if (error && !list) {
    return (
      <ScreenContainer>
        <ListError onRetry={onRetry} />
      </ScreenContainer>
    );
  }
  if (loading || !list) {
    return (
      <ScreenContainer>
        <ListLoading />
      </ScreenContainer>
    );
  }

  const isEmpty = api.totalCount === 0;
  return (
    <ScreenContainer>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ListHeader title={list.title} market={list.market} />
            <BudgetHero
              totalCents={api.estimatedTotalCents}
              checkedCount={api.checkedCount}
              totalCount={api.totalCount}
              budgetCents={list.budgetCents}
              status={api.budgetStatus}
              onRecalculate={onRecalculate}
              onAddItem={handleAddItem}
            />
            {isEmpty ? null : (
              <CategoryChips available={available} selected={activeFilter} onSelect={setFilter} />
            )}
          </>
        }
        ListEmptyComponent={isEmpty ? <EmptyState onAddItem={handleAddItem} /> : null}
        ListFooterComponent={isEmpty ? null : <ListTip />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.base },
});
