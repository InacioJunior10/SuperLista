import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, SectionList, StyleSheet } from "react-native";

import { ScreenContainer } from "@/components";
import {
  AddItemSheet,
  BudgetHero,
  BudgetSheet,
  CategoryChips,
  CategorySectionHeader,
  EmptyState,
  ListError,
  ListHeader,
  ListInfoSheet,
  ListLoading,
  ListTip,
  ShoppingItemRow,
} from "@/features/lists/components";
import { groupByCategory } from "@/features/lists/grouping";
import { useShoppingList } from "@/features/lists/ListsProvider";
import { spacing } from "@/theme";
import type { Category, ShoppingItem } from "@/types/list";

export default function ListaScreen() {
  const api = useShoppingList();
  const { list, loading, error, items } = { ...api, items: api.list?.items };
  const [filter, setFilter] = useState<Category | null>(null);
  const [itemSheet, setItemSheet] = useState<{ item?: ShoppingItem } | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

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
  const onAdd = useCallback(() => setItemSheet({}), []);
  const onItemMenu = useCallback((itemId: string) => {
    const item = apiRef.current.list?.items.find((i) => i.id === itemId);
    if (!item) return;
    Alert.alert(item.name, undefined, [
      { text: "Editar", onPress: () => setItemSheet({ item }) },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          Alert.alert("Remover item?", `Remover ${item.name} da lista?`, [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Remover",
              style: "destructive",
              onPress: () => void apiRef.current.removeItem(itemId),
            },
          ]),
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, []);
  const onDelete = useCallback((itemId: string) => {
    const item = apiRef.current.list?.items.find((i) => i.id === itemId);
    if (!item) return;
    Alert.alert("Excluir item?", `Excluir "${item.name}" da lista?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => void apiRef.current.removeItem(itemId),
      },
    ]);
  }, []);
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
      <ShoppingItemRow
        item={item}
        onToggle={onToggle}
        onOpen={onOpen}
        onLongPress={onItemMenu}
        onDelete={onDelete}
      />
    ),
    [onToggle, onOpen, onItemMenu, onDelete],
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
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ListHeader title={list.title} market={list.market} onPress={() => setInfoOpen(true)} />
            <BudgetHero
              totalCents={api.cartTotalCents}
              checkedCount={api.checkedCount}
              totalCount={api.totalCount}
              pendingCount={api.pendingCount}
              budgetCents={list.budgetCents}
              status={api.budgetStatus}
              onRecalculate={onRecalculate}
              onAddItem={onAdd}
              onPressBudget={() => setBudgetOpen(true)}
            />
            {isEmpty ? null : (
              <CategoryChips
                available={available}
                totalCount={api.totalCount}
                selected={activeFilter}
                onSelect={setFilter}
              />
            )}
          </>
        }
        ListEmptyComponent={isEmpty ? <EmptyState onAddItem={onAdd} /> : null}
        ListFooterComponent={isEmpty ? null : <ListTip />}
      />
      <AddItemSheet
        visible={itemSheet !== null}
        item={itemSheet?.item}
        onClose={() => setItemSheet(null)}
        onSubmit={(input) => {
          const editing = itemSheet?.item;
          setItemSheet(null);
          void (editing ? api.updateItem(editing.id, input) : api.addItem(input));
        }}
      />
      <BudgetSheet
        visible={budgetOpen}
        budgetCents={list.budgetCents}
        onClose={() => setBudgetOpen(false)}
        onSave={(cents) => {
          setBudgetOpen(false);
          void api.updateBudget(cents);
        }}
      />
      <ListInfoSheet
        visible={infoOpen}
        title={list.title}
        market={list.market}
        onClose={() => setInfoOpen(false)}
        onSave={(info) => {
          setInfoOpen(false);
          void api.updateListInfo(info);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.base },
});
