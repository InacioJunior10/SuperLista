# Desenvolvimento com git worktree e agents

Cada agent trabalha em **uma worktree própria, numa branch própria**, para que vários agents editem em paralelo sem conflitos no diretório de trabalho. Todos os comandos são PowerShell.

## Layout

```
D:\Desenvolvimento\IA\SuperLista              <- worktree principal (branch main) — não desenvolva aqui
D:\Desenvolvimento\IA\SuperLista-worktrees\
    feat-lista-compras\                       <- uma pasta por branch
    feat-modal-preco\
```

As worktrees ficam **fora** do repositório (pasta irmã `SuperLista-worktrees`). Worktrees criadas pelo Claude Code (`isolation: "worktree"`) ficam em `.claude/worktrees/` (ignorado pelo git).

## Convenção de branches

`<tipo>/<slug-curto>` em minúsculas: `feature/` (ou `feat/`), `fix/`, `chore/`, `docs/`, `refactor/`, `test/`. Exemplos: `feature/lista-compras`, `feature/modal-preco`, `fix/total-arredondamento`. Nome da pasta = branch com `/` trocado por `-`.

O `new-worktree.ps1` cria a branch se ela não existir e reaproveita se já existir (ex.: branch criada manualmente). Uma branch com checkout na worktree principal não pode ganhar outra worktree: rode `git switch main` na principal antes.

## Fluxo

```powershell
# 1. Criar worktree + branch a partir de main (instala dependências)
.\scripts\new-worktree.ps1 -Branch feat/modal-preco

# 2. Trabalhar na worktree (o agent roda dentro dela)
Set-Location ..\SuperLista-worktrees\feat-modal-preco
# ... editar, testar: .\scripts\check.ps1 ...
git add -A
git commit -m "feat(preco): modal de informar preço"

# 3. Integrar (a partir da worktree principal)
Set-Location D:\Desenvolvimento\IA\SuperLista
git merge --no-ff feat/modal-preco

# 4. Limpar
.\scripts\remove-worktree.ps1 -Branch feat/modal-preco
```

Listar: `git worktree list`. Limpar registros órfãos: `git worktree prune`.

## Regras para agents

1. **Uma tarefa = uma worktree = uma branch.** Nunca edite a worktree principal nem a de outro agent.
2. **Escopo disjunto**: ao paralelizar, divida por arquivos/pastas (ex.: agent A em `src/features/lists/`, agent B em `src/db/`). Arquivos compartilhados (`package.json`, `app.json`, `src/theme/*`, `src/types/*`, `CLAUDE.md`) só são alterados quando a tarefa exigir — e, se possível, por um único agent — para reduzir conflitos.
3. **Dependências novas**: `npx expo install <pkg>` dentro da worktree; informe no commit que `package.json`/`package-lock.json` mudaram.
4. **Antes de concluir**: `.\scripts\check.ps1` deve passar na worktree. Commits pequenos e em português no formato Conventional Commits.
5. **Integração**: antes do merge, atualize a branch com `git merge main` (ou rebase) e rode os checks de novo. Resolva conflitos em `package-lock.json` regenerando com `npm install`.
6. **Não faça** `git push --force`, `git reset --hard` em branch compartilhada, nem apague worktree com alterações não commitadas.
7. **Cada worktree tem seu próprio `node_modules`** (o script instala). Não compartilhe via link simbólico.
8. Servidor Expo em paralelo: use portas diferentes (`npx expo start --port 8082`).

## Usando o Claude Code

- Subagent isolado: ferramenta Agent com `isolation: "worktree"` (cria worktree temporária em `.claude/worktrees/`, removida se não houver mudanças).
- Sessão inteira numa worktree: `claude --worktree <nome>` ou abrir o Claude Code dentro de `..\SuperLista-worktrees\<pasta>`.
- Ao delegar a um agent, informe: branch, escopo (arquivos permitidos), requisito do PRD (RF-xx) e o critério de pronto (`.\scripts\check.ps1` verde).
