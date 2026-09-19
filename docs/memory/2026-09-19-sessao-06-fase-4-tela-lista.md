# Sessão 06 — 2026-09-19 — Fase 4: tela Lista de Compras

Branch: `feature/tela-lista` (`7b1950b` + commit de docs), a partir de `main` em `cead048`.

## O que foi feito
Tela da aba Lista (`app/(tabs)/index.tsx`) implementada por um agent e conferida pelo orquestrador (check próprio, diff, busca de rede, busca de cores/tamanhos soltos, leitura da tela):
- `src/features/lists/components/`: `ListHeader`, `BudgetHero`, `CategoryChips`, `CategorySectionHeader`, `ShoppingItemRow` (memo), `ListTip`, `EmptyState`, `ListStates` (`ListLoading`, `ListError`).
- `src/utils/format.ts`: `formatWeightKg`, `formatItemDetail`, `formatListSubtitle`.
- `app/preco/[itemId].tsx`: placeholder "Em breve" (modal registrado em `app/_layout.tsx`) — a fase 5 o substitui.
- 77 testes no total (8 suítes): seções na ordem do PRD, filtro, marcar não muda o total, `setItemPrice` atualiza o hero, "Definir preço", detalhe kg/un, navegação pela linha (checkbox não navega), Recalcular com confirmação, alertas de meta, vazio/erro/carregando, 200 itens.

## Regras do usuário aplicadas
- Hero "Total da lista" = `estimatedTotalCents` (soma de TODOS os itens); marcar só muda "N de M pegos".
- Tocar na linha abre `/preco/[itemId]`; o `Checkbox` é um alvo separado.
- Preço 0 mostra "Definir preço".

## Decisões / desvios do Stitch
- Rótulo "Total da lista" no lugar de "Total estimado no carrinho" (a regra do total mudou).
- Ícone de perfil `account-outline` direto no `ListHeader` (`iconMap` não o tem); texto da dica aproximado; botões "Recalcular" (secundário) e "+ Item" (primário) lado a lado.
- Chips só para categorias com itens; filtro sem itens volta para "Todos"; erro com lista já carregada mantém a lista.
- Callbacks estáveis via ref da API do provider para não re-renderizar todas as linhas a cada toggle.
- `__tests__/home.test.tsx` removido (testava o placeholder antigo); `shell.test.tsx` usa stub na aba Lista.
- O agent rodou `prettier --write` em todo `__tests__`: 5 testes antigos com diff só de formatação.

## Pendências
1. Fase 5 (`feature/modal-preco`): modal de preço no lugar do placeholder; converter gramas ↔ kg no Stepper.
2. Fase 6 (`feature/meta-itens`): formulário `+ Item` (hoje `Alert "Em breve"` em `handleAddItem`), toque em "Meta" (`onPressBudget` sem ação), editar/remover itens, várias listas.
3. Conferir visualmente a tela no emulador contra o PNG do Stitch (nenhum agente rodou o app); teste de 200 itens só checa contagem, não mede desempenho (medir na fase 7).
4. Ícone/splash em PNG (pendência da fase 3).
