# Sessão 12 — 2026-09-19 — Modal de preço: nome editável, dropdown de tipo e unidade Pacote

Branch: `feature/preco-nome-unidade-pacote` (`bbe17d9`). Pedidos do usuário (texto colado no chat):
1. Na tela de preço, o nome do item editável em um textbox, alterado junto com o preço.
2. Na quantidade, um dropdown para o usuário escolher o tipo.
3. Adicionar a opção "Pacote" aos tipos de quantidade.

## Entregas
- **Nome editável** (`PriceForm`): TextInput "Nome do item" (máx. 80). Vazio/só espaços desabilita "Salvar Preço" e mostra "Informe o nome do item.". Só alterar nome ou unidade já conta como mudança pendente no "Sair".
- **`Dropdown`** (`src/components/Dropdown.tsx`, exportado no barrel; lista inline, sem Modal): gatilho `button` com `accessibilityState.expanded` e valor em `accessibilityValue`; opções `radio` com `selected` em um `radiogroup`; alvos de 48 px.
- **Tipo de quantidade** no modal: Unidade, Quilo (kg), Gramas (g), Pacote. Conversão da quantidade ao trocar (`convertQuantity` em `src/utils/weight.ts`): kg↔g e un↔pct mantêm o valor; peso→contagem = 1; contagem→kg = 1000; contagem→g = 100. O preço digitado é mantido (o significado muda: por kg/unidade/pacote).
- **Salvar** faz uma única chamada `updateItem(id, { name, unit, unitPriceCents, quantity, checked })` (antes eram três: `setItemPrice`, `setItemQuantity`, `toggleItem`); o total do topo recalcula pelo provider.
- **Unidade Pacote (`pct`)**: `Unit = kg|un|g|pct`; semântica de `un` (quantidade × preço por pacote); "1 pacote"/"2 pacotes × R$ 4,99"; `/pct` no gráfico do histórico; chip "Pacote" no `AddItemSheet`. **Migração v7** recria `items` e `products` com CHECK incluindo `pct`. Lista inicial e `INITIAL_LIST_REVISION` **não** mudaram (itens como "macarrão" continuam em Unidade; o usuário pode trocar pelo modal).
- Verificação: `.\scripts\check.ps1` verde (202 testes, 24 suítes), `expo-doctor` 21/21.

## Observações
- Lacuna de teste: "o nome novo aparece na lista" não tem teste de tela; o teste do modal confere apenas que o nome foi gravado no banco.
- Os avisos "not wrapped in act" do `ListsProvider` nos testes são ruído de log (não falham).
- Não validado no emulador.
