# Sessão 03 — 2026-09-19 — Merge do plano e decisão: somente mobile, dados locais

Branch: `chore/decisao-mobile-local` (a partir de `main` em `d6d43db`).

## O que foi feito
- Merge de `chore/plano-execucao` em `main` (`d6d43db`, `--no-ff`); branch e worktree removidas.
- **Decisão do usuário:** app **somente mobile**; **todo o banco no dispositivo**; **sem APIs, backend ou nuvem** por enquanto.
- Aplicação da decisão:
  - `package.json`: removido o script `web`. `app.json`: removida a config `web`, `platforms: ["android","ios"]`, `userInterfaceStyle: "light"` (alinha com o design system só claro).
  - `README.md`: sem menção a web; explica Android/Expo Go e dados locais.
  - `CLAUDE.md`: regras fixas de plataforma e de "sem rede/backend"; removido comando web; corrigida a linha de tema (claro apenas).
  - `docs/plan/`: nova seção "Decisões tomadas"; fase 3 sem decisão de web; fase 7 troca sincronização por durabilidade local (backup opcional por arquivo); fase 8.3 scanner com **catálogo local** (`products`) em vez de consulta online; fase 9 com política de privacidade "dados só no dispositivo".

## Decisões
- Nenhuma feature da v1.0 pode depender de rede. Integrações online futuras exigem nova decisão explícita.
- Scanner EAN: sem API; produto desconhecido → cadastro manual, salvo em tabela local.
- `react-dom` continua em `package.json` (foi fixado por conflito de peer do npm); avaliar remoção se o install não reclamar.

## Pendências
1. Decisões em aberto restantes: UX de múltiplas listas e mercado (fase 6), mapeamento de ícones (fase 2).
2. Próximo passo: abrir as worktrees das fases 1 (`feature/dominio-totais`) e 2 (`feature/componentes-base`) em paralelo.
