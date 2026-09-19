import { useCallback, useEffect, useState, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components";
import type { ListsRepository } from "@/db/repository";
import { colors, spacing, typography } from "@/theme";

import { ListsProvider } from "./ListsProvider";

const defaultLoad = async () => (await import("@/db/client")).getListsRepository();

export type DatabaseGateProps = {
  children: ReactNode;
  /** Chamado quando o banco abriu ou falhou (ex.: esconder a splash). */
  onSettled?: () => void;
  loadRepository?: () => Promise<ListsRepository>;
};

/** Abre o banco antes de renderizar o app; mostra erro com "Tentar novamente" se falhar. */
export function DatabaseGate({ children, onSettled, loadRepository = defaultLoad }: DatabaseGateProps) {
  const [repository, setRepository] = useState<ListsRepository | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadRepository()
      .then((repo) => active && setRepository(repo))
      .catch(() => active && setFailed(true))
      .finally(() => active && onSettled?.());
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  if (failed) {
    return (
      <View style={styles.center}>
        <Text accessibilityRole="header" style={styles.title}>
          Não foi possível abrir seus dados
        </Text>
        <Text style={styles.body}>Ocorreu um erro ao carregar o banco do aplicativo.</Text>
        <Button label="Tentar novamente" onPress={retry} style={styles.button} />
      </View>
    );
  }
  if (!repository) return null;
  return <ListsProvider repository={repository}>{children}</ListsProvider>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.base,
    backgroundColor: colors.canvas,
  },
  title: { ...typography.headlineMd, color: colors.slate, textAlign: "center" },
  body: { ...typography.bodyMd, marginTop: spacing.sm, color: colors.slateMuted, textAlign: "center" },
  button: { marginTop: spacing.lg },
});