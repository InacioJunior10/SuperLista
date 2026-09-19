import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import { Button, ScreenContainer } from "@/components";
import { colors, spacing, typography } from "@/theme";

export type ScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (ean: string) => void;
};

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e"] as const;

/** Só monta quando visível: cada abertura começa com a leitura liberada. */
export function ScannerModal({ visible, ...rest }: ScannerModalProps) {
  return visible ? <ScannerContent {...rest} /> : null;
}

function ScannerContent({ onClose, onScanned }: Omit<ScannerModalProps, "visible">) {
  const [permission, requestPermission] = useCameraPermissions();
  const done = useRef(false);

  const granted = permission?.granted === true;
  const blocked = permission != null && !permission.granted && permission.canAskAgain === false;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      {granted ? (
        <View style={styles.camera}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
            onBarcodeScanned={({ data }) => {
              if (done.current) return;
              done.current = true;
              onScanned(data);
            }}
          />
          <View style={styles.footer}>
            <Button label="Cancelar" variant="secondary" onPress={onClose} />
          </View>
        </View>
      ) : (
        <ScreenContainer>
          <View style={styles.message}>
            <Text style={styles.text}>Precisamos da câmera para ler códigos de barras.</Text>
            {blocked ? (
              <Text style={styles.text}>
                A permissão foi negada. Você pode digitar o nome do produto manualmente.
              </Text>
            ) : (
              <Button label="Permitir câmera" onPress={() => void requestPermission()} />
            )}
            <Button label="Cancelar" variant="tertiary" onPress={onClose} />
          </View>
        </ScreenContainer>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1, backgroundColor: colors.slate },
  footer: { position: "absolute", bottom: spacing.xl, left: spacing.lg, right: spacing.lg },
  message: { flex: 1, justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  text: { ...typography.bodyLg, color: colors.slate },
});
