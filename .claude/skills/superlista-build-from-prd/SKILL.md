---
name: superlista-build-from-prd
description: Constrói o app SuperLista a partir do PRD (docs/stitch/PRD.md), seguindo o plano de fases, requisitos RF/NFR e o design system. Use ao implementar telas, funcionalidades ou avançar o roadmap do produto.
---

# Construir o SuperLista a partir do PRD

Leia sempre: `docs/stitch/PRD.md` (requisitos), `docs/stitch/DESIGN.md` (visual), `docs/stitch/screens/` (referências) e aplique a skill `superlista-design-system`.

## Mapa PRD -> código

| PRD | Onde implementar |
|---|---|
| 3.1 Tela Lista de Compras | `app/(tabs)/index.tsx` + `src/features/lists/` |
| 3.2 Modal Informar Preço | `app/preco/[itemId].tsx` (modal do Expo Router, `presentation: "formSheet"`/`"modal"`) |
| Bottom nav (Lista, Histórico, Carrinho, Ajustes) | `app/(tabs)/_layout.tsx` (abas; Histórico/Carrinho/Ajustes inicialmente placeholders) |
| RF-01 total em tempo real | função pura `computeTotal(list)` em `src/features/lists/totals.ts` + hook; testes obrigatórios |
| RF-02 máscara BRL | `src/utils/money.ts` (já existe) |
| RF-03 agrupar por categoria | seletor `groupByCategory` (ordem: Hortifrúti, Laticínios, Padaria, Carnes, Limpeza, Outros) |
| RF-04 kg/un | `ShoppingItem.unit`; `priceByWeight` para kg |
| RF-05 edição via modal | tocar no badge de preço/item abre o modal sem sair da lista |
| RF-06 meta de orçamento | `budgetCents` + barra de progresso com alerta perto do teto |
| NFR offline-first | persistência local com `expo-sqlite` (`src/db/`); sem dependência de rede para nada do fluxo principal |
| NFR performance <100ms | listas com `FlatList`/`SectionList`, memoização de totais, sem trabalho pesado no render |

## Fases sugeridas (implemente uma por vez, com testes)

1. **Fundação**: tema (feito), tipos, `money`, camada `src/db` (SQLite) + repositório de listas/itens, seed de dados de exemplo.
2. **Lista**: header, card de orçamento, chips de categoria, `SectionList` agrupada, checkbox, total ao vivo.
3. **Modal de preço**: visor, chips de ajuste rápido, stepper kg/un, toggle "pego", salvar.
4. **Meta de orçamento** e alerta visual; adicionar/remover itens (`+ Item`).
5. **Abas restantes** (Histórico, Carrinho/Checkout, Ajustes) — ver "Próximos passos" do PRD (checkout, histórico com gráfico, scanner EAN via `expo-camera`).

## Regras

- Dinheiro em centavos; regras de negócio em funções puras testadas (`__tests__/`).
- Textos da UI em pt-BR exatamente como no PRD (ex.: "Salvar Preço", "Marcar como pego no carrinho", "Definir preço").
- Antes de finalizar cada fase: `.\scripts\check.ps1`.
- Se o PRD/design mudou no Stitch: use a skill `superlista-sync-stitch`.
