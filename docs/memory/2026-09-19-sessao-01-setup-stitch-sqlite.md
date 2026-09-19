# Sessão 01 — 2026-09-19 — Setup do projeto, Stitch e camada SQLite

Branch final: `feature/sqlite` (commits `28f4792` em `main` e `b187496`).

## Objetivo
Criar o app SuperLista (React Native), configurar o ambiente Claude Code para Windows/PowerShell, importar PRD e design system do Google Stitch, preparar git + worktrees e implementar a camada SQLite.

## O que foi feito

### 1. Estrutura inicial
- App **Expo SDK 57 + React Native 0.86 + TypeScript** com **Expo Router** (`app/`), alias `@/*` → `src/*`.
- Extraído o template `blank-typescript` manualmente: `create-expo-app` falha com npm 12.
- Dependências: expo-router, expo-sqlite, async-storage, reanimated + worklets, gesture-handler, safe-area-context, screens, expo-font, expo-haptics, expo-splash-screen, `@expo-google-fonts/plus-jakarta-sans`, react-dom (fixado 19.2.3 por conflito de peer).
- Qualidade: Jest (jest-expo) + Testing Library v14 (`render` assíncrono), ESLint, Prettier, `scripts/check.ps1`.

### 2. Claude Code
- `CLAUDE.md` com **regra fixa: tudo em PowerShell** (sem bash), comandos, estrutura, convenções.
- `.claude/settings.json` (permissões PowerShell; Bash negado).
- Skills: `rn-component`, `rn-screen`, `rn-test`, `rn-build-release`, `superlista-build-from-prd`, `superlista-design-system`, `superlista-sync-stitch`.
- MCP `stitch` já estava configurado e conectado (`claude mcp list`).

### 3. Stitch → `docs/stitch/`
- Projeto "Lista de Compras Inteligente" (`projects/7386463549503504126`).
- Baixados: `PRD.md`, `DESIGN.md` (Fresh Market Grotesk), 2 telas (HTML + PNG), `logo.svg`.
- Tokens no código: `src/theme/{colors,typography,layout}.ts`; `src/utils/money.ts` (centavos, `formatBRL`); tipos de domínio em `src/types/list.ts`.

### 4. Git e worktrees
- `.gitignore` reforçado, `.gitattributes`, `git init -b main`, commit inicial.
- `docs/WORKTREES.md`, `scripts/new-worktree.ps1`, `scripts/remove-worktree.ps1` (testados).
- Worktree de `feature/sqlite` criada em `..\SuperLista-worktrees\feature-sqlite`; worktree principal voltou para `main`.
- README reduzido a: produto, rodar em localhost, rodar testes.

### 5. Camada SQLite (`src/db/`) — branch `feature/sqlite`
- `migrations.ts` (schema v1: `lists`, `items`; `PRAGMA user_version`; transação por migração), `repository.ts` (CRUD; centavos; cascade), `client.ts` (singleton, WAL, seed só em `__DEV__`), `seed.ts` (12 itens da tela do Stitch), `types.ts` (contrato `Db`).
- Testes com SQLite real em memória via `node:sqlite` (`test-utils/sqliteTestDb.ts`, `__tests__/db.test.ts`). 16 testes passando; typecheck e lint limpos.

## Decisões
- Dinheiro sempre em **centavos inteiros**.
- SQL somente em `src/db`; mudança de schema = nova migração (`version + 1`).
- Cada tarefa/agent em uma worktree e branch própria; `main` não recebe desenvolvimento direto.
- Testes de banco com SQLite real (não mock), via `process.getBuiltinModule("node:sqlite")` porque o resolver do Jest 29 não conhece `node:sqlite`.

## Armadilhas encontradas
- npm 12: `create-expo-app` quebra; `expo install` termina com erro (`EALLOWSCRIPTS`), mas grava as dependências; `npm test -- --ci` é lido como flag do npm.
- TS 6: `baseUrl` obsoleto → usar `paths` com `./src/*`.
- PowerShell: `git commit -F -` com here-string não funciona → usar arquivo de mensagem; `Remove-Item` em comando com here-string contendo `/>` foi bloqueado pela ferramenta.
- `Add-Content` com crases (`` `r ``, `` `f ``) corrompe texto → escrever arquivos com a ferramenta Write.

## Pendências / próximos passos
1. Fazer merge de `feature/sqlite` em `main` e remover a worktree (`.\scripts\remove-worktree.ps1`).
2. Ajustar `new-worktree.ps1` para aceitar prefixo `feature/` e branches já existentes.
3. Fase 2: tela de Lista de Compras (header, card de orçamento, chips, `SectionList`, total em tempo real) usando `getListsRepository()`.
4. Validar `expo-sqlite` no Android e decidir suporte web (exige config extra do Metro).
5. Fase 3: modal de Informar Preço; depois meta de orçamento e abas restantes.
