# Fase 7 — Requisitos não funcionais: offline, desempenho e acessibilidade

**Branch:** `feature/nfr` · **Depende de:** fases 5 e 6
**PRD:** NFR (usabilidade em loja, performance < 100 ms, offline first)

## Tarefas
1. **Offline first**: auditar que nenhum fluxo faz chamada de rede; testar em modo avião (dispositivo/emulador). **Sincronização em segundo plano: fora do escopo** (decidido: sem backend/nuvem; dados só no dispositivo). Registrar no `docs/memory` como item de versão futura. Em vez disso, garantir **durabilidade local**: transações no SQLite, migrações testadas e, opcionalmente, exportar/importar backup do banco em arquivo (`expo-file-system` + `expo-sharing`) sem servidor.
2. **Performance**: medir abertura do modal de preço e recálculo do total (meta < 100 ms) com `performance.now()` em teste/profiling; `React.memo`/`useCallback` nas linhas; `getItemLayout`/`keyExtractor` estáveis; lista de 200 itens fluida (60 fps no perfil).
3. **Acessibilidade**: revisar `accessibilityRole/Label/State/Hint` em todos os controles; leitor de tela (TalkBack) lê "Tomate italiano, 0,800 kg, R$ 8,20, marcado"; respeitar fonte grande do sistema (sem truncar preços); contraste ≥ 4.5:1 (conferir `#00A86B` sobre branco — usar `#006D43` para texto pequeno se necessário).
4. **Usabilidade em loja**: alvos ≥ 44/48 px, tela ligada durante a compra (`expo-keep-awake`, opcional), feedback tátil consistente.
5. **Robustez**: tratamento de erros do banco (mensagens em pt-BR), migração testada de v1 → versão atual com dados reais.
6. **Cobertura**: `npm test -- --coverage`; lógica de domínio e `src/db` ≥ 90%.

## Critérios de aceite
- Relatório de medições (tempos, fps) registrado em `docs/memory/`.
- Checklist de acessibilidade preenchido.
- `.\scripts\check.ps1` verde.
