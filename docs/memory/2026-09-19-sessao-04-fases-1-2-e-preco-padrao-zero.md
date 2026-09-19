# Sessão 04 — 2026-09-19 — Fases 1 e 2 (agents em paralelo) e regra de preço padrão 0

Branch desta sessão: `feature/preco-padrao-zero` (a partir de `main` em `1c0cb5e`).

## O que foi feito
- **Fases 1 e 2 em paralelo**, cada uma numa worktree/branch, executada por um agent e **conferida pelo orquestrador** (check próprio, diff fora de escopo, cores soltas):
  - `feature/dominio-totais` (`8beecdf`): `src/features/lists/` — `categories`, `totals`, `grouping`, `budget` + 11 testes.
  - `feature/componentes-base` (`6e18a79`, `95b19e1`): 10 componentes em `src/components/` + testes (mocks de Reanimated, vector-icons e haptics dentro do próprio teste).
  - Merge `--no-ff` das duas em `main` (`4a03606`, `1c0cb5e`); 44 testes verdes.
- **Decisões do usuário (aplicadas nesta branch):**
  1. Total do topo = **soma de TODOS os itens da lista** (`estimatedTotalCents`); a meta é comparada com ele.
  2. **Todo item tem preço padrão 0** (`unitPriceCents: number`, nunca ausente); 0 mostra "Definir preço".
  3. **Tocar no item abre o modal de preço**; **Salvar Preço atualiza o total do topo**.
- Código: `ShoppingItem.unitPriceCents` obrigatório; repositório usa default 0 e `ItemPatch` sem `null`; **migração v2** (`NULL → 0`); `itemTotalCents` sem caso `undefined`; `PriceBadge` trata `0` como "Definir preço". Testes novos: migração v2, total soma todos os itens, preço começa em 0.
- Docs: plano (fases 4 e 5 e tabela de decisões) e `CLAUDE.md` com a regra de preço/total.
- `scripts/remove-worktree.ps1`: fallback com prefixo `\\?\` quando o git falha com "Filename too long".

## Armadilhas
- **Windows / caminho longo:** `git worktree remove` falha ("Filename too long") em worktrees com `node_modules` e deixa a pasta pela metade; a ferramenta PowerShell bloqueia `rmdir /s`. Solução: `Remove-Item -LiteralPath "\\?\<caminho>" -Recurse -Force`, depois `git worktree prune` e `git branch -d`. (Corrigido no script.)
- Testing Library v14: cada `render` substitui a árvore anterior (não acumula) — um render por teste.
- Agent da fase 2 achou que `expo-asset` faltava; o `npm ls` mostra que vem via `expo`. Confirmar ao rodar no aparelho.

## Pendências
1. Criar `jest.setup` compartilhado com os mocks (Reanimated, vector-icons, haptics) antes das telas (fase 3/4).
2. Mover constantes de tamanho dos componentes (chip 36, checkbox 24, barra 8, escala 0,98) para `src/theme`.
3. Revisar visualmente os ícones de categoria (escolhidos pelo agent).
4. Stepper de kg mostra "2 kg" mas o banco guarda gramas: converter na fase 5.
5. Próximo: fase 3 (`feature/app-shell`) e fase 4 (`feature/tela-lista`).
