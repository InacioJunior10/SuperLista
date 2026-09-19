import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button, Card, MoneyText, ProgressBar } from "@/components";
import type { BudgetStatus } from "@/features/lists/budget";
import { colors, hitTarget, radius, spacing, typography } from "@/theme";
import { formatBRL } from "@/utils/money";

export type BudgetHeroProps = {
  totalCents: number;
  checkedCount: number;
  totalCount: number;
  budgetCents?: number;
  status: BudgetStatus;
  onRecalculate: () => void;
  onAddItem: () => void;
  /** Sem ação por ora (edição da meta fica para uma fase futura). */
  onPressBudget?: () => void;
};

const levelColor = {
  none: colors.slateMuted,
  ok: colors.slateMuted,
  warning: colors.amber,
  over: colors.danger,
} as const;

function warningText(status: BudgetStatus): string | null {
  if (status.level === "over") return `Meta ultrapassada em ${formatBRL(-status.remainingCents)}`;
  if (status.level === "warning") return `Atenção: você já usou ${status.percent}% da meta`;
  return null;
}

export function BudgetHero({
  totalCents,
  checkedCount,
  totalCount,
  budgetCents,
  status,
  onRecalculate,
  onAddItem,
  onPressBudget,
}: BudgetHeroProps) {
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;
  const warning = warningText(status);
  const budgetLabel = budgetCents ? `Meta: ${formatBRL(budgetCents)}` : "Definir meta";
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Total da lista</Text>
      <MoneyText cents={totalCents} style={styles.total} />
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{`${checkedCount} de ${totalCount} pegos`}</Text>
        <Text style={styles.progressPercent}>{`${Math.round(progress * 100)}%`}</Text>
      </View>
      <ProgressBar
        progress={progress}
        level="ok"
        accessibilityLabel={`${checkedCount} de ${totalCount} itens pegos`}
      />
      <Pressable
        onPress={onPressBudget}
        accessibilityRole="button"
        accessibilityLabel={budgetLabel}
        style={styles.budget}
      >
        <Text style={[styles.budgetText, { color: levelColor[status.level] }]}>{budgetLabel}</Text>
      </Pressable>
      {warning ? (
        <Text
          accessibilityRole="alert"
          style={[styles.warning, { color: levelColor[status.level] }]}
        >
          {warning}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button
          label="Recalcular"
          variant="secondary"
          onPress={onRecalculate}
          style={styles.action}
        />
        <Button label="+ Item" onPress={onAddItem} style={styles.action} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  label: { ...typography.labelLg, color: colors.slateMuted },
  total: { ...typography.display, color: colors.slate },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  progressText: { ...typography.labelLg, color: colors.slate },
  progressPercent: { ...typography.labelLg, color: colors.slateMuted },
  budget: { minHeight: hitTarget, justifyContent: "center" },
  budgetText: { ...typography.labelLg },
  warning: { ...typography.bodyMd },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },
  action: { flex: 1 },
});
