# Sessão 11 — 2026-09-19 — Menu inferior fixo e lista inicial exata no banco

Branch: `fix/menu-inferior-e-lista-inicial` (`d3b8b0c`).

## Pedidos do usuário
1. "Ao marcar um item como pego o menu inferior sobe/sobrepõe a tela, atrapalhando o layout" → resposta à pergunta: o menu **deve ficar fixo** no rodapé.
2. Inserir no banco os itens da lista passada, **"nem item a mais nem a menos"**.

## Menu inferior (não reproduzido sem emulador; causas prováveis eliminadas)
- `ScreenContainer`: `bottomInset` agora é `false` por padrão (removida a folga de 80 px que duplicava o espaço da barra de abas); o respiro final da Lista e do Histórico vem de `contentContainerStyle` (`spacing.xl`).
- `removeClippedSubviews` removido da SectionList da Lista e da FlatList do Histórico (causa conhecida de reflow no Android).
- Barra de abas com altura fixa `sizes.tabBar + insets.bottom` (novo token `sizes.tabBar = hitTarget + spacing.sm`), `paddingBottom = insets.bottom`, sem `position: absolute`, `tabBarHideOnKeyboard: false`.
- Confirmado por teste: marcar um item não troca a tela para "carregando" nem remonta o cabeçalho. Testes em `__tests__/menu-fixo.test.tsx` e `lista-screen.test.tsx`.
- **Não validado em dispositivo**: se o comportamento persistir, abrir issue com vídeo/print e o aparelho/versão do Android.

## Lista inicial exata
- Causa: `seedIfEmpty` só semeava com banco vazio; emuladores com dados antigos (lista de exemplo de 12 itens ou "Minha lista") ficavam com itens a mais/menos.
- Migração **v6**: tabela `app_meta (key, value)`.
- `syncInitialList(db, repo)` (`src/db/seed.ts`, `INITIAL_LIST_REVISION = 1`): uma vez por revisão, numa transação, **apaga todas as listas** e cria "Lista de compras" com os 41 itens exatos (preço 0, desmarcados, sem meta); `purchases` e `products` intactos; depois disso as edições do usuário são preservadas. `getListsRepository()` a chama em todas as builds. Para forçar nova carga: incrementar `INITIAL_LIST_REVISION`.
- Teste `__tests__/initial-list.test.ts` com fixture independente do seed (41 itens transcritos da lista do usuário): compara nome/quantidade/unidade/ordem, ausência de itens a mais ou a menos, idempotência com preservação de edições, atualização de banco antigo (listas antigas removidas) e migração v5→v6.
- Divergências entre a lista do usuário e o seed: nenhuma.

## Atenção
- Na primeira abertura após esta versão, **as listas existentes no aparelho são substituídas** pela lista inicial (pedido explícito do usuário). O histórico de compras é preservado.
- "Limpar todos os dados" (Ajustes) apaga as listas; a lista inicial **não** volta sozinha (a revisão já está gravada). Para voltar a ela: reinstalar o app ou incrementar a revisão.

## Verificação
`.\scripts\check.ps1`: typecheck + lint sem warnings + 185 testes (23 suítes).
