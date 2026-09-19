# Sessão 07 — 2026-09-19 — Onda 1: modal de preço, meta/itens, ajustes e ícone

Decisão do usuário nesta sessão: **terminar todo o plano, POC (caminho mais simples), lista única, testes no emulador só no final (issues depois)**. Registrado em `docs/plan/README.md` e `CLAUDE.md`. Merges locais na `main` feitos pelo orquestrador após conferir cada branch (check próprio, diff, rede, cores/tamanhos soltos).

## Entregas (3 agents em paralelo, worktrees separadas)
- **`feature/modal-preco` (`b61b168`)** — fase 5: `app/preco/[itemId].tsx` (modal), `price-modal/PriceForm` e `WeightStepper`, `src/utils/weight.ts`. Máscara BRL, chips +R$ 0,50/1,00/2,00/5,00 e Zerar, total ao vivo, stepper un/kg (50 g), toggle "pego", Sair (confirma se houver mudança) e Salvar Preço (atualiza o total do topo). Preço máx. R$ 999.999,99. Stepper próprio porque o `Stepper` base não exibe "0,8 kg".
- **`feature/meta-itens` (`5777960`)** — fase 6: `Sheet` (Modal RN), `AddItemSheet` (adicionar/editar item, categoria sugerida por palavra-chave em `suggestCategory.ts`), `BudgetSheet` (meta), `ListInfoSheet` (título/mercado). Toque longo na linha abre Editar/Remover. Provider ganhou `updateItem` e `updateListInfo`.
- **`feature/ajustes-icone` (`c60b41f`)** — aba Ajustes (Sobre o app + "Limpar todos os dados" via `clearAllData`), ícone/splash gerados por `scripts/generate-icons.mjs` com `sharp` (devDependency; script `npm run icons`), `adaptiveIcon.backgroundColor` #00A86B.

## Observações
- Fora da POC (não feito): desfazer por snackbar, ordenar pendentes primeiro, alternar un/kg no modal.
- `Sheet.tsx` tem `minHeight: 48` literal (deveria ser `hitTarget`) — ajuste trivial.
- Abertura do modal < 100 ms não medida (ficará para o teste no emulador).
- `ajustes.tsx` usa `require("@/db/client")` no `onPress` (o Jest não executa `import()` dinâmico) com `eslint-disable`.

## Próximo
Onda 2: 8.1 Checkout (migração v3 `purchases`) e 8.3 Scanner (migração v4 `products`) em paralelo; depois 8.2 Histórico, fase 7 (NFR) e fase 9 (release).
