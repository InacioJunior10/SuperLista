# Sessão 10 — 2026-09-19 — Total só dos "Pego", unidade g, lista inicial e tela fiel ao Stitch

Pedido do usuário (lista de 6 alterações colada no chat + respostas a duas perguntas). Branches: `feature/total-pego-unidade-g` (`846de0c`) e `feature/tela-lista-fidelidade` (`d554008`).

## Decisões do usuário
- **Total do topo = soma SÓ dos itens marcados "Pego"** (substitui a regra da sessão 04); a meta é comparada com esse total. `cartTotalCents` é o total do topo; `estimatedTotalCents` (todos os itens) continua existindo.
- **Nova unidade "Gramas" (`g`)**: quantidade em gramas e preço por kg (mesma fórmula do kg); só muda a apresentação ("500 g").
- **Lista inicial** (41 itens, preços 0, nada marcado, sem meta) no primeiro uso em **todas** as builds (antes o seed só rodava em `__DEV__`).
- Recomendação de skills de terceiros (grill-me, grill-with-docs, wayfinder): **não instaladas** (código de terceiros; decisão do usuário).

## Entregas
1. **Dados/regras (`846de0c`)**: `Unit = kg|un|g`; migração **v5** (recria `items` e `products` com CHECK incluindo `g`); categoria `mercearia` ("Mercearia & Grãos"; "Limpeza & Higiene" para os sabonetes/shampoo); `budgetStatus` usa `cartTotalCents`; provider expõe `cartTotalCents` e `pendingCount`; formulário, modal de preço, checkout e histórico entendem `g`; `suggestCategory` com novas palavras; `seedIfEmpty` com a lista do usuário; docs (`CLAUDE.md`, plano) atualizados; 172 testes.
2. **Tela (`d554008`)**: lista alinhada ao modelo (texto e cores do HTML do Stitch): header "SuperLista • <título>", card "Total estimado no carrinho", "Progresso de itens", "N de M pegos", "N itens pendentes ignorados", meta, chips "Todos (N)", seções com ícone colorido (`categoryColors` no tema), dica e bottom nav; **lixeira por item** com confirmação "Excluir item?" (Cancelar/Excluir); 177 testes.

## Suposições a revisar (editáveis no app)
- Itens em gramas/kg sem peso explícito na lista do usuário usam **100 g** (linguiça, requeijão, margarina, café, legumes).
- Frango/coxinha/sobrecoxa/coxa em kg com a quantidade dada (5, 4, 4, 4 kg); "1 kg de carne moída" = 1 kg.
- Categorias atribuídas por mim (ex.: café, Nescau, suco e macarrão em Mercearia; Patês Jade em Outros).
- O app instalado antes desta mudança só mostra a lista nova com o **banco vazio**: usar "Limpar todos os dados" ou reinstalar.

## Diferenças em relação ao Stitch (relatadas pelo agent)
Título da dica "Dica da SuperLista" (o HTML diz "Dica do SuperLista"); total em `typography.display` na cor `primary`; sem pendentes o texto é "Todos os itens no carrinho!"; botão "store" do header omitido; bottom nav na altura padrão do React Navigation; botão de recalcular com 48 px; `PriceBadge` "Definir preço" com fundo um pouco diferente; prettier reformatou alguns arquivos de `src/features/lists/components` e `src/theme` (só formatação).

## Pendências
1. Testar no emulador e abrir issues (ver `docs/RELEASE.md`), inclusive comparar a tela com o Stitch.
2. Mensagens "not wrapped in act" nos testes de `ajustes.test.tsx` (ruído de log; não falham).
