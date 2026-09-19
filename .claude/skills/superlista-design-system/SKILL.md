---
name: superlista-design-system
description: Aplica o design system "Fresh Market Grotesk" (Stitch) em telas e componentes React Native do SuperLista - cores, tipografia Plus Jakarta Sans, raios, sombras, chips, itens de lista, barra de totais. Use ao criar ou revisar qualquer UI.
---

# Design system — Fresh Market Grotesk

Fonte da verdade: `docs/stitch/DESIGN.md` (exportado do Google Stitch). Referências visuais: `docs/stitch/screens/*.png` e `*.html`. Logo: `assets/logo.svg`.

## Regras

1. **Nunca use valores soltos.** Importe tokens de `@/theme`:
   - Cores: `colors.brand` (#00A86B), `colors.canvas` (fundo), `colors.card`, `colors.stroke`, `colors.slate` (texto), `colors.gold`, `colors.danger`, `colors.amber`.
   - Tipografia: `...typography.bodyLg` etc. A família já define o peso (RN não usa `fontWeight` com fontes customizadas).
   - Espaço/forma: `spacing`, `radius`, `elevation`, `hitTarget` (48), `bottomClearance` (80).
2. **Valores em R$**: use `typography.currencyDisplay` (tabular-nums, peso 800) e `formatBRL(cents)` de `@/utils/money`. Dinheiro é sempre inteiro em centavos.
3. **Formas**: inputs/badges `radius.base`; cards, modais e bottom sheets `radius.lg`; botões sticky e hero `radius.xl`; chips e steppers `radius.full`.
4. **Elevação**: cards de lista = `elevation.level1`; modal/arrastando = `elevation.level2`; barra de totais fixa = `elevation.totalizer` (fundo ~90% opaco).
5. **Toque**: alvos mínimos 48px (`hitTarget`); nunca abaixo de 44px. Sempre `accessibilityRole`/`accessibilityLabel`.
6. **Modo claro apenas** (alto contraste). Margem lateral 16px; deixe 80px de folga inferior sob barras fixas.

## Componentes (ver seção "Components" do DESIGN.md)

- **Botão primário**: fundo `brand`, texto branco, bold; ao pressionar, `scale(0.98)`. **Secundário**: fundo `brandSoft`, texto `brand`. **Terciário**: transparente, borda `strokeStrong`, texto `slateMuted`.
- **Chip de categoria**: altura 36, pill; ativo = fundo `brand` + texto branco; inativo = branco, borda `stroke`, texto `slateMuted`.
- **Item de lista**: checkbox circular 24px (borda 2px `strokeStrong`; marcado = fundo `brand` + check branco, com haptic `expo-haptics`); título `bodyLg`; meta `bodySm` cinza; marcado = cinza + tachado; à direita badge de preço com ícone de edição.
- **Card de orçamento (hero)**: total em destaque, barra de progresso de itens pegos, meta de gastos com alerta (dourado/âmbar) perto do teto.
- **Bottom nav**: 4 abas — Lista (ativa), Histórico, Carrinho, Ajustes.
- **Modal de preço**: bottom sheet `radius.lg`, visor do valor, chips `+R$ 0,50/1,00/2,00/5,00` + `Zerar`, stepper, toggle "Marcar como pego no carrinho", botões `Sair` (secundário) e `Salvar Preço` (primário).

## Fluxo ao criar UI

1. Abra o PNG da tela correspondente em `docs/stitch/screens/` e o trecho do PRD.
2. Compare com o HTML do Stitch só para medidas/ícones (não copie HTML/Tailwind).
3. Implemente com tokens; crie/atualize componentes em `src/components/`.
4. Ícones: `@expo/vector-icons` (MaterialIcons/Ionicons equivalentes aos Material Symbols do Stitch).
5. Valide: `npm run typecheck; npm run lint; npm test`.

Se o design mudar no Stitch, rebaixe com a skill `superlista-sync-stitch`.
