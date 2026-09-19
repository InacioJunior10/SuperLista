---
name: rn-component
description: Cria um componente React Native reutilizável do SuperLista (TypeScript, StyleSheet, tema, acessibilidade, teste). Use ao pedir novo componente de UI.
---

# Criar componente

1. Crie `src/components/<Nome>.tsx` (ou `src/features/<feature>/components/`).
2. Padrão:
   - Props tipadas com `type <Nome>Props`; export nomeado do componente.
   - Estilos com `StyleSheet.create`, cores de `@/theme/colors`.
   - `accessibilityRole` e `accessibilityLabel` em elementos interativos (`Pressable`).
   - Sem lógica de negócio: extraia para hook em `src/hooks` ou feature.
3. Crie o teste `__tests__/<Nome>.test.tsx` com `@testing-library/react-native`.
4. Valide no PowerShell: `npm run typecheck; npm run lint; npm test`.

Exemplo mínimo:

```tsx
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

type ButtonProps = { label: string; onPress: () => void };

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.button}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, padding: 12, borderRadius: 8 },
  label: { color: "#fff", fontWeight: "600" },
});
```

Use apenas comandos PowerShell.
