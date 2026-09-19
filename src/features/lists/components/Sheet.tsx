import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import { colors, hitTarget, radius, spacing } from "@/theme";

export type SheetProps = { visible: boolean; onClose: () => void; children: ReactNode };

/** Bottom sheet simples: fecha ao tocar no fundo. O conteúdo só é montado quando visível. */
export function Sheet({ visible, onClose, children }: SheetProps) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        accessibilityViewIsModal
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View style={styles.sheet}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const sheetStyles = StyleSheet.create({
  input: {
    minHeight: hitTarget,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    color: colors.slate,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.slate, opacity: 0.4 },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
