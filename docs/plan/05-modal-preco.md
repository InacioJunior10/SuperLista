# Fase 5 — Modal Informar Preço

**Status:** Concluída · **Branch:** `feature/modal-preco` · **Depende de:** fase 4 · **Paralela com:** fase 6
**PRD:** 3.2 · RF-02 (máscara BRL), RF-04 (kg/un), RF-05 (edição rápida) · **Referência visual:** `docs/stitch/screens/modal-informar-preco.png`

## Escopo (arquivos)
`app/preco/[itemId].tsx` (apresentação modal/bottom sheet), `src/features/lists/components/price-modal/`. Não alterar a tela da lista além do necessário para abrir o modal.

## Tarefas
1. **Rota modal** `/preco/[itemId]` (`presentation: "formSheet"` ou `"modal"`), aberta ao **tocar no item da lista**; abre em < 100 ms sem sair do contexto da lista. O preço inicial de todo item é **R$ 0,00** (visor e campo começam zerados).
2. **Header**: tag da categoria + nome do produto + botão fechar (X).
3. **Visor do valor** "VALOR TOTAL NO PACOTE" (`R$ 8,20`) + linha "Pesagem: 0,800 kg × R$ 10,25/kg".
4. **Entrada de preço** com máscara BRL (`parseCents`/`formatBRL`): digitar `1025` → `R$ 10,25`; teclado numérico.
5. **Ajuste rápido**: chips `+R$ 0,50`, `+R$ 1,00`, `+R$ 2,00`, `+R$ 5,00` e `Zerar`.
6. **Quantidade/peso**: `Stepper` — `un` de 1 em 1; `kg` em passos de 50 g (mostrando "0,8 kg"); rótulo "Bandeja com 800 gramas".
7. **Toggle** "Marcar como pego no carrinho" (marca o item como pego; não altera o total do topo, que já inclui o item).
8. **Rodapé**: `Sair` (descarta alterações pendentes, com confirmação se houver) e `Salvar Preço` (grava no SQLite, atualiza o item e **atualiza o total do topo da lista**, que é a soma de todos os itens; fecha o modal).
9. Alternância `un`/`kg` do item quando fizer sentido (RF-04), atualizando a fórmula exibida.

## Testes
Máscara e chips somam corretamente; `Zerar`; cálculo por peso; `Sair` não persiste; `Salvar Preço` persiste e o total da lista muda; toggle "pego".

## Critérios de aceite
- Abertura < 100 ms (medir e registrar no `docs/memory`).
- Uso com uma mão: todos os alvos ≥ 48px, botões ao alcance do polegar.
- `.\scripts\check.ps1` verde.

