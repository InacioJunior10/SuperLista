import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon, MoneyText, ProgressBar } from "@/components";
import type { BudgetStatus } from "@/features/lists/budget";
import { colors, elevation, hitTarget, radius, sizes, spacing, typography } from "@/theme";
import { formatBRL } from "@/utils/money";

export type BudgetHeroProps = {
  totalCents: number;
  checkedCount: number;
  totalCount: number;
  pendingCount: number;
  budgetCents?: number;
  status: BudgetStatus;
  onRecalculate: () => void;
  onAddItem: () => void;
  /** Abre o sheet da meta. */
  onPressBudget?: () => void;
};

const levelColor = {
  none: colors.secondary,
  ok: colors.secondary,
  warning: colors.amber,
  over: colors.danger,
} as const;

function warningText(status: BudgetStatus): string | null {
  if (status.level === "over") return `Meta ultrapassada em ${formatBRL(-status.remainingCents)}`;
  if (status.level === "warning") return `Atenção: você já usou ${status.percent}% da meta`;
  return null;
}

function pendingText(pending: number): string {
  if (pending === 0) return "Todos os itens no carrinho!";
  return `${pending} ${pending === 1 ? "item pendente ignorado" : "itens pendentes ignorados"}`;
}

export function BudgetHero({
  totalCents,
  checkedCount,
  totalCount,
  pendingCount,
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
    <View style={styles.wrap}>
      <View style={styles.summary}>
        <View style={styles.summaryTexts}>
          <Text style={styles.label}>Total estimado no carrinho</Text>
          <MoneyText cents={totalCents} style={styles.total} />
        </View>
        <Pressable
          onPress={onRecalculate}
          accessibilityRole="button"
          accessibilityLabel="Recalcular"
          style={styles.circle}
        >
          <Icon name="reiniciar" size={sizes.iconMd} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          onPress={onAddItem}
          accessibilityRole="button"
          accessibilityLabel="+ Item"
          style={styles.add}
        >
          <Icon name="adicionar" size={sizes.iconMd} color={colors.onPrimary} />
          <Text style={styles.addText}>Item</Text>
        </Pressable>
      </View>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View style={styles.progressTitle}>
            <Icon name="carrinho" size={sizes.iconMd} color={colors.primary} />
            <Text style={styles.progressLabel}>Progresso de itens</Text>
          </View>
          <Text style={styles.progressValue}>{`${checkedCount} de ${totalCount} pegos`}</Text>
        </View>
        <ProgressBar
          progress={progress}
          level="ok"
          accessibilityLabel={`${checkedCount} de ${totalCount} itens pegos`}
          style={styles.track}
        />
        <View style={styles.progressRow}>
          <Text style={styles.pending}>{pendingText(pendingCount)}</Text>
          <Pressable
            onPress={onPressBudget}
            accessibilityRole="button"
            accessibilityLabel={budgetLabel}
            style={styles.budget}
          >
            <Text style={[styles.budgetText, { color: levelColor[status.level] }]}>
              {budgetLabel}
            </Text>
          </Pressable>
        </View>
        {warning ? (
          <Text
            accessibilityRole="alert"
            style={[styles.warning, { color: levelColor[status.level] }]}
          >
            {warning}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...elevation.level1, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  summaryTexts: { flex: 1 },
  label: { ...typography.labelMd, color: colors.onSurfaceVariant },
  total: { ...typography.display, color: colors.primary },
  circle: {
    width: hitTarget,
    height: hitTarget,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  add: {
    minHeight: hitTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  addText: { ...typography.labelLg, color: colors.onPrimary },
  progressCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.base,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  progressTitle: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  progressLabel: { ...typography.labelMd, color: colors.onSurfaceVariant },
  progressValue: { ...typography.headlineSm, color: colors.onSurface },
  track: { backgroundColor: colors.surfaceContainerHighest },
  pending: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1 },
  budget: { minHeight: hitTarget, justifyContent: "center" },
  budgetText: { ...typography.labelMd },
  warning: { ...typography.bodySm },
});
