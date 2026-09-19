# SuperLista

App mobile de listas de compras em **React Native + Expo (SDK 57) + TypeScript**, com **Expo Router** (rotas por arquivo em `app/`).

## Produto e design (fonte da verdade — Google Stitch)

Projeto Stitch: "Lista de Compras Inteligente" (`projects/7386463549503504126`), já baixado em `docs/stitch/`:

- `docs/stitch/PRD.md` — requisitos do produto (RF-01..06, NFRs, telas). **Leia antes de implementar qualquer funcionalidade.**
- `docs/stitch/DESIGN.md` — design system **Fresh Market Grotesk** (cores, tipografia, formas, componentes).
- `docs/stitch/screens/` — telas de referência (`.png` para ver, `.html` para medidas). `docs/stitch/assets/logo.svg` — logo.

Regras de produto/design:
- Toda UI usa os tokens de `@/theme` (`colors`, `typography`, `spacing`, `radius`, `elevation`); **sem cores, tamanhos ou fontes soltos**. Fonte: Plus Jakarta Sans. Cor primária `#00A86B`. Somente modo claro.
- **Dinheiro é sempre inteiro em centavos**; exiba com `formatBRL` (`@/utils/money`), padrão `R$ 0,00`, algarismos tabulares.
- Offline-first: fluxo principal sem internet (persistência local em `src/db`, `expo-sqlite`).
- Banco: acesse só via `getListsRepository()` (`@/db`); nunca escreva SQL fora de `src/db`. Mudança de schema = **nova migração** em `migrations.ts` (`version + 1`), jamais editar uma existente. Testes de banco usam `createTestDb()` de `test-utils/`.
- Textos da UI em pt-BR, idênticos ao PRD (ex.: "Salvar Preço", "Marcar como pego no carrinho").
- Alvos de toque ≥ 48px; `accessibilityRole`/`accessibilityLabel` em elementos interativos.
- Para construir o app, siga as skills `superlista-build-from-prd` e `superlista-design-system`. Se o design/PRD mudar no Stitch, use `superlista-sync-stitch` (MCP `stitch` já configurado).

## Ambiente e shell (REGRA FIXA)

- Ambiente de desenvolvimento: **Windows 11**.
- **Todos os comandos e scripts devem ser em PowerShell (`.ps1`)**, nunca bash/sh.
  - Use a ferramenta `PowerShell` para executar comandos. Não use a ferramenta `Bash` nem sintaxe POSIX (`export`, `rm -rf`, `&&` com `$VAR`, `/dev/null`, `cat`, `grep`, `touch`, `mkdir -p`).
  - Equivalentes: `$env:VAR = "x"`, `Remove-Item -Recurse -Force`, `New-Item -ItemType Directory -Force`, `Get-Content`, `Select-String`, `2>$null`.
  - Scripts de automação ficam em `scripts/` como `.ps1`. Não crie `.sh`.
  - Caminhos com barra invertida ou entre aspas quando houver espaços.
  - Strings multilinha para executáveis nativos: here-string com aspas simples `@'...'@` (fechamento na coluna 0).
- Node 24+ / npm 12. Observação: o `create-expo-app` falha com npm 12 (não interpreta o `npm pack`); para novos templates, extraia o tarball manualmente.
- npm 12 bloqueia scripts de instalação; se um pacote precisar, use o campo `allowScripts` no `package.json`.

## Git e worktrees (desenvolvimento com agents)

Guia completo: `docs/WORKTREES.md`. Resumo das regras:

- Branch principal: `main`. **Não desenvolva na worktree principal** — cada tarefa/agent usa uma worktree e uma branch própria.
- Criar: `.\scripts\new-worktree.ps1 -Branch feature/<slug>` (cria a branch se não existir, em `..\SuperLista-worktrees\feature-<slug>`, e roda `npm install`). Remover (a partir da worktree principal): `.\scripts\remove-worktree.ps1 -Branch feature/<slug> -DeleteBranch`. Os scripts funcionam de qualquer worktree.
- Branches: `<tipo>/<slug>` com tipo em `feature|feat|fix|chore|docs|refactor|test`. Commits em português, Conventional Commits (`feat(preco): ...`), pequenos.
- Ao paralelizar agents, divida por escopo de arquivos disjunto; evite mexer em `package.json`, `app.json`, `src/theme/*`, `src/types/*` e `CLAUDE.md` sem necessidade.
- Antes de concluir: `.\scripts\check.ps1` verde **dentro da worktree**. Sem `git push --force`, sem `reset --hard` em branch compartilhada.
- Servidores Expo em paralelo usam portas diferentes (`--port 8082`).
- Ao delegar a um agent, informe branch, escopo de arquivos, requisito do PRD (RF-xx) e critério de pronto. Para subagents use `isolation: "worktree"`.

## Plano de execução (`docs/plan/`)

A ordem oficial de implementação do PRD está em `docs/plan/README.md` (fases 1–9, dependências, branches, escopo de arquivos, critérios de aceite e decisões em aberto). **Siga a ordem do plano**: antes de iniciar uma fase, confira as dependências e leia o arquivo da fase. Ao concluir, marque o status no README do plano e registre em `docs/memory/`.

## Memória de sessões (`docs/memory/`) — REGRA FIXA

Ao final de **cada sessão de trabalho**, crie (ou atualize, se for a mesma sessão) um arquivo em `docs/memory/` descrevendo o que foi feito.

- Nome: `AAAA-MM-DD-sessao-NN-<slug>.md` (NN sequencial; ex.: `2026-09-19-sessao-01-setup-stitch-sqlite.md`).
- Conteúdo: objetivo, o que foi feito (por área), decisões, armadilhas encontradas, pendências/próximos passos, branch e commits.
- Inclua o arquivo no commit da branch da tarefa. Não guarde segredos nem chaves.
- No início de uma sessão, leia o arquivo mais recente de `docs/memory/` para retomar o contexto.

## Comandos (PowerShell)

| Tarefa | Comando |
|---|---|
| Instalar deps | `npm install` |
| Iniciar dev server | `npm start` |
| Android (emulador/dispositivo) | `npm run android` |
| Web | `npm run web` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Testes | `npm test` |
| Verificação completa | `.\scripts\check.ps1` |
| Instalar lib compatível com o SDK | `npx expo install <pacote>` |
| Diagnóstico | `npx expo-doctor` |

Sempre use `npx expo install` (não `npm install`) para libs nativas/Expo, para respeitar as versões do SDK.

## Estrutura

```
app/              Rotas (Expo Router). _layout.tsx = layout raiz. Somente telas finas.
src/components/   Componentes reutilizáveis (UI pura)
src/features/     Módulos por funcionalidade (ex.: lists/) com componentes, hooks e lógica
src/hooks/        Hooks compartilhados
src/services/     Integrações externas / API
src/db/           Persistência local (expo-sqlite): migrations.ts (PRAGMA user_version), repository.ts, seed.ts, client.ts (singleton `getListsRepository()`)
test-utils/       Helpers de teste (sqliteTestDb.ts: SQLite real em memória via node:sqlite)
src/theme/        Tokens do design system (colors, typography, layout)
src/types/        Tipos TypeScript compartilhados
src/utils/        Funções puras
__tests__/        Testes (Jest + Testing Library)
scripts/          Scripts PowerShell (check, new-worktree, remove-worktree)
docs/             PRD/design do Stitch (docs/stitch), plano (docs/plan), memória de sessões (docs/memory), WORKTREES.md
.claude/skills/   Skills do Claude para este projeto
```

Alias de import: `@/*` → `src/*` (ex.: `import { colors } from "@/theme/colors"`).

## Convenções

- TypeScript `strict`. Evite `any`; tipos de domínio em `src/types`.
- Componentes funcionais com hooks; um componente por arquivo, nome em PascalCase; hooks começam com `use`.
- Estilos via `StyleSheet.create` e tokens de `src/theme`. Suporte a tema claro/escuro (`userInterfaceStyle: automatic`).
- Telas em `app/` devem apenas compor componentes de `src/`; lógica fica em hooks/features.
- Listas longas: `FlatList`/`FlashList`, nunca `ScrollView` com `.map`.
- Navegação tipada (`typedRoutes` ativo); use `Link`/`router` do `expo-router`.
- Textos da interface em **português (pt-BR)**; código e identificadores em inglês.
- Acessibilidade: `accessibilityLabel`/`accessibilityRole` em elementos interativos.
- Não adicione dependências sem necessidade; prefira módulos Expo.
- Reanimated 4 exige `react-native-worklets` (já instalado).

## Qualidade

Antes de concluir uma tarefa: `npm run typecheck`, `npm run lint` e `npm test` devem passar (ou rode `.\scripts\check.ps1`). Escreva testes para lógica nova.

## Skills do projeto (`.claude/skills/`)

- `rn-component` — criar componentes reutilizáveis
- `rn-screen` — criar telas/rotas com Expo Router
- `rn-test` — escrever e rodar testes
- `rn-build-release` — build e publicação com EAS
- `superlista-build-from-prd` — implementar o app a partir do PRD (mapa RF → código, fases)
- `superlista-design-system` — aplicar o design system Fresh Market Grotesk
- `superlista-sync-stitch` — rebaixar PRD/design/telas do Stitch e atualizar tokens
