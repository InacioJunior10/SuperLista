# Fase 2 — Componentes base (design system)

**Branch:** `feature/componentes-base` · **Depende de:** fase 0 · **Paralela com:** fase 1
**Referência:** `docs/stitch/DESIGN.md` (seção Components), telas em `docs/stitch/screens/`; skills `rn-component` e `superlista-design-system`.

## Escopo (arquivos)
`src/components/` e `__tests__/components/`. Não tocar em `src/db`, `src/features`, `app/`.

## Tarefas (um componente por arquivo, com teste)
1. **`Button`** — variantes `primary` (#00A86B), `secondary` (fundo #E8F5E9), `tertiary` (borda); estado pressionado `scale(0.98)`; `accessibilityRole="button"`; altura ≥ 48.
2. **`Chip`** — pill 36px, ativo/inativo; usado nos filtros de categoria e nos ajustes rápidos de preço (`+R$ 0,50`).
3. **`Checkbox`** — círculo 24px, hit area 48, animação do check (Reanimated) + `expo-haptics`; `accessibilityRole="checkbox"` e `accessibilityState.checked`.
4. **`PriceBadge`** — badge de preço com ícone de edição; variante "Definir preço" (amber) quando sem preço.
5. **`ProgressBar`** — barra de progresso (itens pegos) com variantes de cor pelo nível (`ok/warning/over`).
6. **`Stepper`** — pill `[-] valor [+]`, com `unit` (un/kg), alvo de toque 48.
7. **`Card`** — `elevation.level1`, raio 16.
8. **`Icon`** — wrapper de `@expo/vector-icons` com o mapeamento dos ícones do Stitch (lista, histórico, carrinho, ajustes, categorias, editar, fechar, check).
9. **`MoneyText`** — `formatBRL` + `typography.currencyDisplay`/tabular-nums.
10. **`ScreenContainer`** — SafeArea + fundo `canvas` + folga inferior `bottomClearance`.

## Testes
Renderização, `onPress`, estados (marcado/desmarcado, ativo/inativo), acessibilidade (role/label/state), `MoneyText` formata `16886` → `R$ 168,86`.

## Critérios de aceite
- Nenhum valor de cor/tamanho fora de `@/theme`.
- Todos os alvos de toque ≥ 48px.
- `.\scripts\check.ps1` verde.
