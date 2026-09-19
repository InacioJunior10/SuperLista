# Fase 6 — Meta de orçamento e gestão de itens/listas

Status: Concluída

**Branch:** `feature/meta-itens` · **Depende de:** fase 4 · **Paralela com:** fase 5
**PRD:** RF-06 (meta), `+ Item`, recálculo/reset

## Escopo (arquivos)
`src/features/lists/components/` (novos: `AddItemSheet`, `BudgetSheet`, `ListPicker`), `app/lista/` (rotas de criação/seleção, se houver). Evitar editar arquivos da fase 5.

## Tarefas
1. **Definir/editar meta**: toque em "Meta: R$ 200,00" abre sheet com campo BRL; salvar/remover meta (`updateList`).
2. **Alerta visual** (RF-06): hero e barra mudam para dourado/âmbar em `warning` (≥ 80%) e coral em `over` (> 100%), com texto ("Você ultrapassou a meta em R$ 12,30") e sem bloquear o uso.
3. **`+ Item`**: sheet com nome, categoria (chips), unidade (un/kg) e quantidade; preço opcional; sugestão de categoria por palavra-chave simples (ex.: "tomate" → Hortifrúti).
4. **Editar/remover item**: ação por deslizar ou menu; desfazer via snackbar.
5. **Recalcular** no hero: desmarca todos os itens (com confirmação) e recomputa.
6. **Lista única (decidido)**: sem seletor nem criação de várias listas. Apenas editar o **título** e o **mercado** (texto livre) da lista ativa, tocando no cabeçalho.
7. Ordenação dentro da seção: pendentes primeiro, marcados ao final (opcional, atrás de configuração).

## Testes
Limites do alerta (79/80/100/101 %); adicionar item aparece na seção certa; remover/desfazer; reset; excluir lista apaga itens.

## Critérios de aceite
- Alerta de meta visível e sem susto (cores do design system).
- `.\scripts\check.ps1` verde.
