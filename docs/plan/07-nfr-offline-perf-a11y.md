# Fase 7 — Requisitos não funcionais: offline, desempenho e acessibilidade

**Branch:** `feature/nfr` · **Depende de:** fases 5 e 6
**PRD:** NFR (usabilidade em loja, performance < 100 ms, offline first)

## Tarefas
1. **Offline first**: auditar que nenhum fluxo faz chamada de rede; testar em modo avião (dispositivo/emulador). Definir estratégia de **sincronização em segundo plano** (decisão em aberto): se houver backend, criar `src/services/sync` com fila de mudanças (coluna `updated_at` + `dirty` via **nova migração**); se não, registrar no `docs/memory` que fica para versão futura.
2. **Performance**: medir abertura do modal de preço e recálculo do total (meta < 100 ms) com `performance.now()` em teste/profiling; `React.memo`/`useCallback` nas linhas; `getItemLayout`/`keyExtractor` estáveis; lista de 200 itens fluida (60 fps no perfil).
3. **Acessibilidade**: revisar `accessibilityRole/Label/State/Hint` em todos os controles; leitor de tela (TalkBack) lê "Tomate italiano, 0,800 kg, R$ 8,20, marcado"; respeitar fonte grande do sistema (sem truncar preços); contraste ≥ 4.5:1 (conferir `#00A86B` sobre branco — usar `#006D43` para texto pequeno se necessário).
4. **Usabilidade em loja**: alvos ≥ 44/48 px, tela ligada durante a compra (`expo-keep-awake`, opcional), feedback tátil consistente.
5. **Robustez**: tratamento de erros do banco (mensagens em pt-BR), migração testada de v1 → versão atual com dados reais.
6. **Cobertura**: `npm test -- --coverage`; lógica de domínio e `src/db` ≥ 90%.

## Critérios de aceite
- Relatório de medições (tempos, fps) registrado em `docs/memory/`.
- Checklist de acessibilidade preenchido.
- `.\scripts\check.ps1` verde.
