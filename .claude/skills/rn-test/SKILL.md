---
name: rn-test
description: Escreve e executa testes Jest + React Native Testing Library no SuperLista. Use ao adicionar testes ou depurar falhas de teste.
---

# Testes

- Stack: `jest` + `jest-expo` + `@testing-library/react-native`. Config em `package.json` (`"jest"`).
- Arquivos em `__tests__/*.test.ts(x)`.
- Prefira consultas por papel/texto/label (`getByRole`, `getByText`, `getByLabelText`); evite testar detalhes de implementação.
- No RNTL v14, `render` e `fireEvent` são assíncronos: use `await render(...)` e `await fireEvent.press(...)`.
- Mocks de módulos nativos com `jest.mock(...)` no topo do teste.
- Lógica pura (`src/utils`, reducers) deve ter testes unitários simples.

Comandos (PowerShell):

```powershell
npm test                          # todos
npm test -- --watch               # modo watch
npm test -- home.test.tsx         # um arquivo
npm test -- --coverage
```
