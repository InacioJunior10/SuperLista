import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import { ScreenContainer } from "@/components";
import { useShoppingList } from "@/features/lists/ListsProvider";
import { PriceForm } from "@/features/lists/components/price-modal/PriceForm";

export default function PrecoModal() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { list, loading, toggleItem, setItemPrice, setItemQuantity } = useShoppingList();
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
        onSave={async ({ priceCents, quantity, checked }) => {
          await setItemPrice(item.id, priceCents);
          if (quantity !== item.quantity) await setItemQuantity(item.id, quantity);
          if (checked !== item.checked) await toggleItem(item.id);
        }}
      />
    </ScreenContainer>
  );
}
