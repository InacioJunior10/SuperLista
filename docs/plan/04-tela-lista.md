# Fase 4 — Tela Lista de Compras

**Branch:** `feature/tela-lista` · **Depende de:** fases 1, 2, 3

**Status: Concluída**
**PRD:** 3.1 · RF-01, RF-03 · **Referência visual:** `docs/stitch/screens/lista-de-compras.png`

## Escopo (arquivos)
`app/(tabs)/index.tsx`, `src/features/lists/components/`. Skills: `rn-screen`, `superlista-design-system`.

## Tarefas
1. **Header**: título da lista + mercado e data ("Pão de Açúcar • Hoje"), ícone de perfil (placeholder) e atalhos.
2. **Card de Orçamento (hero)**: total do topo = **soma de TODOS os itens da lista** (`estimatedTotalCents`, marcados ou não; itens com preço 0 somam 0) em R$ com `currencyDisplay`, "5 de 12 pegos" + `ProgressBar`, "Meta: R$ 200,00" com cor pelo `budgetStatus`, botões **Recalcular** (reset de marcações, com confirmação) e **+ Item**.
3. **Chips de categoria**: `Todos` + categorias, rolagem horizontal, filtra a lista.
4. **Lista agrupada** (`SectionList`): cabeçalho de seção com ícone, nome e "N itens"; linhas de item com `Checkbox`, nome, detalhe ("0,800 kg × R$ 10,25/kg" / "2 un"), `PriceBadge` com edição; marcado = cinza + tachado.
5. **Total em tempo real** (RF-01): o hero reflete a soma dos itens assim que um preço/quantidade é salvo no modal; marcar/desmarcar só altera a contagem "N de M pegos" e o risco, **não o total do topo**. Persistência imediata.
6. **Estados**: lista vazia (CTA "Adicionar primeiro item"), carregando (skeleton simples), erro.
7. **Dica do rodapé** ("Dica da SuperLista") conforme tela — opcional, atrás de um componente simples.
8. **Tocar na linha do item** (nome, detalhe ou `PriceBadge`) abre o modal de preço (rota da fase 5; aqui, `router.push` para `/preco/[itemId]`). O `Checkbox` é um alvo de toque separado: só marca/desmarca. Todo item começa com preço 0 e mostra o badge "Definir preço".

## Testes
Renderiza seções na ordem; filtro por chip; marcar item atualiza total e contagem; badge "Definir preço" para item sem preço; lista vazia.

## Critérios de aceite
- Visual fiel ao PNG do Stitch (comparar lado a lado).
- Rolagem fluida com a lista do seed (12 itens) e com 200 itens de teste.
- `.\scripts\check.ps1` verde.
