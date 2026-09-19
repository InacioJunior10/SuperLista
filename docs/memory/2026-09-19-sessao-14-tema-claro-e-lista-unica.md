# Sessão 14 — 2026-09-19 — Tema sempre claro e lista inicial "se existe, não cria outra"

Branch: `fix/tema-claro-e-lista-inicial` (`de4a3ce`). Pedidos do usuário: (1) usa o celular em modo escuro, mas o app deve usar somente o próprio tema (sem modo escuro por enquanto); (2) "Se ela [a lista] existir, não cria outra; se não existir pode criar."

## Tema sempre claro
- `expo-system-ui ~57.0.4` (única dependência nova; o aviso do `expo prebuild` dizia que `userInterfaceStyle` precisava dele). `npx expo install` falhou com EALLOWSCRIPTS mas gravou no `package.json`; instalado com `npm install --ignore-scripts`.
- `app.json`: `userInterfaceStyle: "light"` + `backgroundColor: "#F8FAFC"`. `app/_layout.tsx`: `Appearance.setColorScheme("light")` uma vez no carregamento do módulo (diálogos/teclado seguem o claro). StatusBar `dark`.
- Testes (`__tests__/theme-light.test.ts`): chamada a `setColorScheme("light")`, nenhuma ocorrência de `useColorScheme` em `src/`/`app/`, `app.json` e `package.json` coerentes.
- Muda código nativo: o APK precisa ser regerado com `.\scripts\build-apk.ps1 -Clean` (novo `prebuild`).

## Lista inicial: regra não destrutiva
- **Substitui** o modelo "sincronização por revisão" da sessão 11 (que apagava todas as listas ao mudar a revisão).
- `ensureInitialList(repo)` (`src/db/seed.ts`): se existe QUALQUER lista, não faz nada (retorna `false`); se não existe nenhuma, cria "Lista de compras" com os 41 itens exatos (preço 0, desmarcados, sem meta) e retorna `true`. **Single-flight** (promise em módulo): chamadas simultâneas nunca criam duas listas.
- Usada em `getListsRepository()` (todas as builds) e no fallback "sem listas" do `ListsProvider` (antes criava "Minha lista" vazia; agora cria a lista inicial). "Limpar todos os dados" apaga as listas e o `reload()` recria a lista inicial (a confirmação avisa: "A lista inicial será recriada.").
- Removidos `syncInitialList`, `INITIAL_LIST_REVISION` e `seedIfEmpty`. A tabela `app_meta` (migração v6, imutável) permanece sem uso.
- Testes (`__tests__/initial-list.test.tsx`, fixture independente com os 41 itens): banco vazio => uma lista exata; lista existente (inclusive outro título) => nada muda; chamadas repetidas/simultâneas => uma lista; edições preservadas; provider e `clearAllData` + `reload` => uma lista inicial só.

## Consequência a lembrar
Aparelho/emulador que já tem qualquer lista (ex.: dados antigos) **mantém** o que tem e não recebe a lista de 41 itens automaticamente: usar "Limpar todos os dados" em Ajustes (recria a lista inicial) ou reinstalar.

## Verificação
`.\scripts\check.ps1`: typecheck + lint sem warnings + 209 testes (25 suítes); `expo-doctor` 21/21; `expo export --platform android` compila.
