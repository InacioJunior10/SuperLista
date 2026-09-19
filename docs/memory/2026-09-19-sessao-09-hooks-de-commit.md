# Sessão 09 — 2026-09-19 — Hooks de commit semântico em português e VS Code

Branch: `chore/git-hooks`.

## Pedido
Hook para gerar o comentário (mensagem de commit) automático do VS Code no padrão de semantic git (Conventional Commits) e em português.

## O que foi feito
- **`.githooks/commit-msg` (+ `.ps1`)**: valida `tipo(escopo)!: descrição` — tipos `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`, ≤ 72 caracteres, sem ponto final, recusa descrições que começam com verbo comum em inglês (heurística de "português"). Isenta merges, reverts e fixup/squash. Mostra exemplos ao rejeitar.
- **`.githooks/prepare-commit-msg` (+ `.ps1`)**: quando se roda `git commit` sem `-m`, sugere a mensagem a partir do stage: tipo inferido por caminhos (docs, test, chore, feat para arquivos novos em `src/`/`app/`, fix/refactor), escopo quando único (`lists`, `db`, `components`, `app`, `scripts`, `hooks`…), verbos em português (adiciona/atualiza/remove/renomeia) e corpo em tópicos com os arquivos.
- **`scripts/install-hooks.ps1`** (`npm run hooks`): `git config core.hooksPath .githooks` (vale para todas as worktrees); `-Remove` desativa.
- **`.vscode/settings.json`**: `github.copilot.chat.commitMessageGeneration.instructions` faz o botão de gerar mensagem do VS Code (Copilot) produzir Conventional Commits em português; validação de tamanho na caixa de commit; terminal padrão PowerShell. `.vscode/extensions.json` recomenda Copilot Chat, ESLint e Prettier.
- `.gitattributes` força LF nos shims; shims marcados executáveis no índice; `CLAUDE.md` documenta os hooks.

## Decisões / limites
- O botão de faíscas do VS Code **não passa por hook do git**: é do GitHub Copilot e se configura pelo `settings.json`. Os hooks cobrem `git commit` no terminal e a **validação** de qualquer commit (inclusive os feitos pelo VS Code).
- O VS Code exige mensagem não vazia, então o `prepare-commit-msg` não dispara a sugestão pela caixa do VS Code; nela, use o botão de gerar.
- Exceção à regra "sem sh": os dois shims de 2 linhas (o git só executa hooks via sh); toda a lógica é PowerShell.
- Bypass consciente: `git commit --no-verify`.

## Testes (manuais, repositório descartável)
`feat(lists): adiciona Foo.tsx e atualiza Bar.tsx`, `docs: adiciona plano.md`, muitos arquivos/vários escopos → `feat: adiciona a.ts, F1.tsx e mais 4`; rejeitados: `Add stuff`, `feat: adiciona x.`, `mensagem qualquer`, `feat(db): update total`; aceitos: `feat(db): corrige total ao remover item` e `Merge branch 'x'`.
