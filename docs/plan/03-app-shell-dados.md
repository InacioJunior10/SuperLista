# Fase 3 — Shell do app e acesso aos dados

**Branch:** `feature/app-shell` · **Depende de:** fase 1 · **Paralela com:** fase 2 (após 1)
**PRD:** Bottom navigation (3.1), NFR offline

## Escopo (arquivos)
`app/_layout.tsx`, `app/(tabs)/`, `src/hooks/`, `src/features/lists/` (hooks/estado, não lógica pura), `package.json` só se necessário. Skill: `rn-screen`.

## Tarefas
1. **Plataforma (decidido): somente mobile**, dados só no dispositivo. Não configurar web nem Metro/wasm; testar em Android (emulador ou Expo Go).
2. **Navegação por abas** `app/(tabs)/_layout.tsx` com 4 abas: **Lista** (ativa), **Histórico**, **Carrinho**, **Ajustes** — ícones e rótulos do PRD, cor ativa `#00A86B`. Histórico/Carrinho/Ajustes com tela placeholder ("Em breve").
3. **Inicialização do banco** no layout raiz: `getListsRepository()` antes de esconder a splash; tela de erro com "Tentar novamente" se falhar.
4. **Provider/hook de dados**: `ListsProvider` + `useShoppingList(listId)` expondo lista, ações (`toggleItem`, `setItemPrice`, `addItem`, `removeItem`, `updateBudget`) e recarga; estado atualizado de forma otimista e persistido no SQLite.
5. Definir a **lista ativa** (a mais recente ou a última aberta — guardar id em AsyncStorage).
6. Ícone/splash com o logo (`assets/logo.svg` → PNGs em `assets/`) e nome do app.

## Testes
Hook com `createTestDb()` (ações atualizam estado e banco), layout de abas renderiza os 4 rótulos, falha de banco mostra tela de erro.

## Critérios de aceite
- App abre nas abas, aba Lista ativa; dados sobrevivem a reiniciar o app.
- Nenhuma consulta SQL fora de `src/db`.
- `.\scripts\check.ps1` verde.
