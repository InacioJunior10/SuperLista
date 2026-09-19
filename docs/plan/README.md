# Plano de execução — SuperLista (PRD)

Fonte: [`docs/stitch/PRD.md`](../stitch/PRD.md) · Design: [`docs/stitch/DESIGN.md`](../stitch/DESIGN.md) · Como trabalhar com branches/agents: [`docs/WORKTREES.md`](../WORKTREES.md).

Cada fase é **uma branch + uma worktree** e termina com `.\scripts\check.ps1` verde, merge `--no-ff` em `main` e um registro em `docs/memory/`.

## Ordem de execução

| # | Fase | Branch | Depende de | Requisitos do PRD | Paralelizável com |
|---|---|---|---|---|---|
| 0 | Fundação (**concluída**) | `chore/*`, `feature/sqlite` | — | RF-02, RF-04 (base), NFR offline | — |
| 1 | [Domínio e totais](01-dominio-totais.md) | `feature/dominio-totais` | 0 | RF-01, RF-03, RF-04, RF-06 (lógica) | 2 |
| 2 | [Componentes base](02-componentes-base.md) | `feature/componentes-base` | 0 | Design system | 1 |
| 3 | [Shell do app e dados](03-app-shell-dados.md) | `feature/app-shell` | 1 | Navegação, NFR offline | 2 (após 1) |
| 4 | [Tela Lista de Compras](04-tela-lista.md) | `feature/tela-lista` | 1, 2, 3 | PRD 3.1, RF-01, RF-03 | — |
| 5 | [Modal Informar Preço](05-modal-preco.md) | `feature/modal-preco` | 4 | PRD 3.2, RF-02, RF-04, RF-05 | 6 |
| 6 | [Meta de orçamento e gestão de itens](06-meta-e-itens.md) | `feature/meta-itens` | 4 | RF-06, `+ Item`, reset | 5 |
| 7 | [Offline, desempenho e acessibilidade](07-nfr-offline-perf-a11y.md) | `feature/nfr` | 5, 6 | NFR completos | — |
| 8 | [Abas futuras](08-abas-futuras.md) | `feature/checkout`, `feature/historico`, `feature/scanner` | 7 | PRD seção 7 | entre si |
| 9 | [Release](09-release.md) | `chore/release-1-0` | 7 (8 opcional) | — | — |

```
0 ─┬─ 1 ─┬─ 3 ─┐
   └─ 2 ─┴─────┴─ 4 ─┬─ 5 ─┐
                     └─ 6 ─┴─ 7 ─┬─ 8 (checkout | histórico | scanner)
                                 └─ 9
```

## Regras válidas para todas as fases

- **Antes de codar:** ler o PRD, o `DESIGN.md` e o arquivo mais recente de `docs/memory/`; abrir o PNG da tela em `docs/stitch/screens/`.
- **Worktree:** `.\scripts\new-worktree.ps1 -Branch feature/<slug>`; nunca desenvolver na `main`.
- **Dinheiro em centavos**, textos em pt-BR idênticos ao PRD, tokens de `@/theme`, SQL só em `src/db`, toque ≥ 48px, `accessibilityRole/Label`.
- **Testes:** lógica pura com testes unitários; UI com Testing Library (`await render`); banco com `createTestDb()`.
- **Definição de pronto (DoD):** `.\scripts\check.ps1` verde · critérios de aceite da fase atendidos · sem `console.log` · `docs/memory/` atualizado · commits Conventional Commits em português.
- **Ao delegar a um agent:** informar branch, escopo de arquivos, RF-xx e o DoD. Fases paralelas não devem tocar os mesmos arquivos (veja "Escopo" em cada fase).

## Decisões em aberto (resolver antes da fase indicada)

| Decisão | Fase | Observação |
|---|---|---|
| Suporte a **web** com `expo-sqlite` (exige config do Metro/wasm) ou app só mobile | 3 | Hoje o README cita `w` para web; ajustar conforme decisão |
| **Sincronização em segundo plano** (NFR "Offline First") não tem backend definido | 7 | Definir backend (ex.: Supabase/Firebase) ou adiar; até lá, 100% local |
| Múltiplas listas e criação de nova lista (PRD mostra só uma lista ativa) | 6 | Definir UX (seletor no header?) |
| Mercado selecionado: texto livre ou cadastro | 6 | PRD: "Pão de Açúcar • Hoje" |
| Ícones: Material Symbols do Stitch → `@expo/vector-icons` | 2 | Mapear cada ícone usado nas telas |
