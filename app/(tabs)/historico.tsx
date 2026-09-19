import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { ScreenContainer } from "@/components";
import type { PurchasesRepository } from "@/db/purchases";
import { HistoryList } from "@/features/history/HistoryList";

const getRepo = async (): Promise<PurchasesRepository> => {
  // require lazy: evita carregar expo-sqlite até a aba ser usada (e nos testes de shell)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getPurchasesRepository } = require("@/db/purchases-client") as typeof import("@/db/purchases-client");
  return getPurchasesRepository();
};

export default function HistoricoScreen() {
  const [token, setToken] = useState(0);
  useFocusEffect(useCallback(() => setToken((t) => t + 1), []));
  return (
    <ScreenContainer>
      <HistoryList getRepo={getRepo} refreshToken={token} />
    </ScreenContainer>
  );
}
