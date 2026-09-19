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
- **Preço dos itens:** todo item tem `unitPriceCents` numérico, **padrão 0** (nunca `undefined`/`null`); 0 = badge "Definir preço". O **total do topo é a soma só dos itens marcados "Pego"** (`cartTotalCents`); a meta é comparada com esse total (`estimatedTotalCents` = todos os itens continua exportado). Unidades: `un`, `kg` e `g` — em `kg` e `g` a `quantity` está em **gramas** e o preço é **por kg** (mesma fórmula); `g` só muda a exibição ("500 g"). **Lista inicial:** no primeiro uso (banco vazio, em TODAS as builds) `seedIfEmpty` cria "Lista de compras" com 41 itens, preços 0 e desmarcados. **Tocar na linha do item abre o modal de preço** (o checkbox só marca) e **Salvar Preço atualiza o total do topo**.
- **Escopo de plataforma (decidido em 2026-09-19): somente app mobile (Android/iOS), sem versão web.** Não adicione `react-native-web`, script `web` nem config web.
- **Todos os dados ficam no dispositivo (SQLite, `src/db`). Não há API, backend, nuvem, login nem sincronização** por enquanto: não crie chamadas de rede (`fetch`/axios/SDKs de backend) nem serviços online, e não adicione dependências para isso. Qualquer mudança nisso exige decisão explícita do usuário, registrada em `docs/plan/README.md` e `docs/memory/`. O app funciona 100% offline.
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
- **Hooks de commit** (`.githooks/`, ativar uma vez com `.\scripts\install-hooks.ps1`): `commit-msg` **rejeita** mensagens fora de `tipo(escopo): descrição` em português (≤ 72 caracteres, sem ponto final, sem verbo inicial em inglês); `prepare-commit-msg` sugere a mensagem a partir dos arquivos em stage quando se roda `git commit` sem `-m`. Merges, reverts e fixups são isentos. Ao commitar, escreva a mensagem já nesse formato (mensagem em arquivo + `git commit -F`). A lógica é PowerShell; os arquivos `.githooks/commit-msg` e `.githooks/prepare-commit-msg` são só shims de 2 linhas exigidos pelo git (única exceção à regra "sem sh").
- **VS Code:** `.vscode/settings.json` instrui o botão de gerar mensagem de commit (GitHub Copilot) a usar esse mesmo padrão em português.
- Ao paralelizar agents, divida por escopo de arquivos disjunto; evite mexer em `package.json`, `app.json`, `src/theme/*`, `src/types/*` e `CLAUDE.md` sem necessidade.
- Antes de concluir: `.\scripts\check.ps1` verde **dentro da worktree**. Sem `git push --force`, sem `reset --hard` em branch compartilhada.
- Servidores Expo em paralelo usam portas diferentes (`--port 8082`).
- Ao delegar a um agent, informe branch, escopo de arquivos, requisito do PRD (RF-xx) e critério de pronto. Para subagents use `isolation: "worktree"`.

## Plano de execução (`docs/plan/`)

A ordem oficial de implementação do PRD está em `docs/plan/README.md` (fases 1–9, dependências, branches, escopo de arquivos, critérios de aceite e decisões em aberto). **Siga a ordem do plano**: antes de iniciar uma fase, confira as dependências e leia o arquivo da fase. Ao concluir, marque o status no README do plano e registre em `docs/memory/`.

**Projeto é uma POC:** prefira sempre o caminho mais rápido e simples; lista única (sem várias listas); nada de features "opcionais" do plano nem dependências desnecessárias. O usuário testa no emulador só no final e abre issues para correções.

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
jest.setup.tsx    Mocks globais de Jest (Reanimated, vector-icons, expo-haptics): testes de tela/hook não repetem esses mocks
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
- Estilos via `StyleSheet.create` e tokens de `src/theme`. Somente tema claro (`userInterfaceStyle: light`), conforme o design system.
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
