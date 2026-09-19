---
name: rn-screen
description: Cria uma tela/rota no SuperLista com Expo Router (arquivo em app/, layout, navegação tipada). Use ao pedir nova tela ou fluxo de navegação.
---

# Criar tela

1. Crie o arquivo de rota em `app/`:
   - `app/lista/[id].tsx` → rota dinâmica (`useLocalSearchParams`).
   - `app/(tabs)/` → grupo de abas com `_layout.tsx` usando `Tabs`.
2. A tela só compõe componentes de `src/`; dados e lógica vêm de hooks (`src/features/...`).
3. Registre título/opções em `Stack.Screen` no `_layout.tsx` correspondente.
4. Navegue com `Link` ou `router.push("/lista/123")` (rotas tipadas; rode `npm start` uma vez para gerar `.expo/types`).
5. Trate estados: carregando, vazio, erro. Use `SafeAreaView` de `react-native-safe-area-context` quando a tela não estiver sob header.
6. Listas com `FlatList`; `keyExtractor` estável.
7. Adicione teste em `__tests__/` e valide: `npm run typecheck; npm run lint; npm test`.

Comandos sempre em PowerShell.
