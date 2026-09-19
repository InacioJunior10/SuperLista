# Sessão 02 — 2026-09-19 — Scripts de worktree e plano de execução do PRD

Branch: `chore/plano-execucao` (a partir de `main` em `efd348e`).

## Objetivo
Concluir a sessão 01 (merge de `feature/sqlite`), ajustar os scripts de worktree para o prefixo `feature/` e criar o plano de execução ordenado do PRD.

## O que foi feito
- **Merge** de `feature/sqlite` em `main` (`efd348e`, `--no-ff`); branch apagada e worktree removida; `check.ps1` verde na `main` (16 testes).
- **`scripts/new-worktree.ps1`**: aceita `feature/` (além de `feat|fix|chore|docs|refactor|test`); cria a branch se não existir e **reaproveita se já existir**; mensagem clara quando a branch já está em outra worktree.
- **Bug corrigido nos dois scripts**: rodados de dentro de uma worktree, montavam `SuperLista-worktrees\SuperLista-worktrees\...`. Agora partem do repositório principal (`git rev-parse --git-common-dir`). `remove-worktree.ps1` recusa remover a worktree em que está sendo executado.
- Scripts testados nos casos: `feature/` nova, branch existente, nome inválido, branch em uso, remoção da worktree atual.
- **`docs/plan/`**: `README.md` (tabela de ordem, dependências, grafo, regras gerais, decisões em aberto) + 9 arquivos de fase (`01-dominio-totais` … `09-release`), cada um com branch, escopo de arquivos, tarefas, testes e critérios de aceite.
- `CLAUDE.md`, `docs/WORKTREES.md` e skill `superlista-build-from-prd` apontam para o plano.

## Decisões
- Ordem: 1 domínio ∥ 2 componentes → 3 shell/dados → 4 tela Lista → 5 modal preço ∥ 6 meta/itens → 7 NFR → 8 abas futuras → 9 release.
- Fases 1 e 2 são paralelizáveis por terem escopos de arquivos disjuntos (`features/lists` lógica × `components`).

## Armadilhas
- Script que calcula caminhos a partir de `$PSScriptRoot` quebra dentro de worktrees: usar o `.git` comum.

## Pendências / decisões em aberto (ver `docs/plan/README.md`)
1. Web com `expo-sqlite` ou apenas mobile (fase 3).
2. Backend para sincronização em segundo plano (fase 7).
3. UX de múltiplas listas e mercado (fase 6).
4. Próximo passo: fazer merge desta branch e iniciar as fases 1 e 2 em paralelo.
