import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import { ScreenContainer } from "@/components";
import { useShoppingList } from "@/features/lists/ListsProvider";
import { PriceForm } from "@/features/lists/components/price-modal/PriceForm";

export default function PrecoModal() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { list, loading, updateItem } = useShoppingList();
  const item = list?.items.find((i) => i.id === itemId);

  useEffect(() => {
    if (!loading && list && !item) router.back();
  }, [loading, list, item]);

  if (!item) return null;

  return (
    <ScreenContainer bottomInset={false} style={{ paddingHorizontal: 0 }}>
      <PriceForm
        key={item.id}
        item={item}
        onSave={async ({ name, unit, priceCents, quantity, checked }) => {
          await updateItem(item.id, { name, unit, unitPriceCents: priceCents, quantity, checked });
        }}
      />
    </ScreenContainer>
  );
}
