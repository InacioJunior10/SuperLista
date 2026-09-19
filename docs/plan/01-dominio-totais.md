# Fase 1 — Domínio e totais

**Branch:** `feature/dominio-totais` · **Depende de:** fase 0 · **Paralela com:** fase 2
**PRD:** RF-01 (total em tempo real), RF-03 (agrupar por categoria), RF-04 (kg/un), RF-06 (meta — lógica)

## Escopo (arquivos)
`src/features/lists/` (somente lógica: `totals.ts`, `grouping.ts`, `budget.ts`, `categories.ts`), `__tests__/`. Não tocar em `src/db`, `src/theme`, `app/`.

## Tarefas
1. `categories.ts`: ordem e rótulos pt-BR das categorias — Hortifrúti & Feira, Laticínios & Frios, Padaria & Matinais, Carnes & Aves, Limpeza & Higiene, Outros — com chave, rótulo curto para chip ("Hortifrúti", "Laticínios", "Padaria", "Carnes", "Limpeza") e ícone (nome).
2. `totals.ts` (funções puras, centavos):
   - `itemTotalCents(item)`: `un` → `quantity × unitPriceCents`; `kg` → `priceByWeight(unitPriceCents, quantity)`; sem preço → `0`.
   - `cartTotalCents(list)`: soma dos itens **marcados** (RF-01).
   - `estimatedTotalCents(list)`: soma de todos os itens com preço.
   - `checkedCount` / `totalCount` (ex.: "5 de 12 pegos").
3. `grouping.ts`: `groupByCategory(items)` → seções na ordem do PRD, omitindo vazias, com contagem ("3 itens") e filtro opcional por categoria (chips).
4. `budget.ts`: `budgetStatus(list)` → `{ percent, remainingCents, level: "ok" | "warning" | "over" | "none" }`. Regra: `warning` a partir de 80% da meta, `over` acima de 100%, `none` sem meta.
5. Arredondamento: sempre `Math.round` em centavos; nunca ponto flutuante acumulado.

## Testes obrigatórios
Itens kg/un, item sem preço, lista vazia, arredondamento (800 g × R$ 10,25/kg = R$ 8,20), marcar/desmarcar altera o total, agrupamento e ordem, filtro por categoria, limites 79/80/100/101 % da meta.

## Critérios de aceite
- Exemplo do PRD confere: seed da lista "Compras do mês" gera totais coerentes e reproduzíveis nos testes.
- Nenhuma função usa `number` decimal de reais.
- `.\scripts\check.ps1` verde.
