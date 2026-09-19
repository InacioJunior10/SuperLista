# SuperLista

Aplicativo mobile de lista de compras com **orçamento em tempo real** para quem faz compras em supermercados e feiras.

Planeje a lista por categorias (Hortifrúti, Laticínios, Padaria, Carnes, Limpeza), registre o preço real na gôndola (por unidade ou por quilo) e acompanhe o total acumulado em R$ antes de chegar ao caixa, com meta de gastos e alerta ao se aproximar do teto. Funciona offline dentro do mercado.

Detalhes do produto: [`docs/stitch/PRD.md`](docs/stitch/PRD.md).

## Como rodar em localhost

Pré-requisitos: Node.js 24+ e npm.

```powershell
npm install
npm start
```

No terminal do Expo:

- `w` abre a versão web em `http://localhost:8081`
- `a` abre no emulador Android (ou escaneie o QR code com o app **Expo Go** no celular)

Atalhos: `npm run web` e `npm run android`.

## Como rodar os testes

```powershell
npm test                 # testes unitários (Jest)
npm run typecheck        # checagem de tipos
npm run lint             # lint
.\scripts\check.ps1      # tudo acima em sequência
```
