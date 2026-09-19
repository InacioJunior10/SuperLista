# Fase 8 — Abas e telas futuras (PRD seção 7)

**Depende de:** fase 7 · **Três branches independentes** (podem ir em paralelo, uma worktree por agent). Antes de cada uma, gerar a tela no **Stitch** (MCP `stitch`, skill `superlista-sync-stitch`) para manter o design system.

## 8.1 Checkout / Carrinho finalizado — `feature/checkout` (aba Carrinho)
- Resumo com recibo estimado (itens marcados, subtotal por categoria), comparativo com a meta, divisão por método de pagamento (dinheiro, débito, crédito, vale-alimentação).
- Ação "Finalizar Compra" (CTA da barra de totais): arquiva a lista como compra concluída (nova migração: tabela `purchases` com snapshot de itens/preços).
- Escopo: `app/(tabs)/carrinho.tsx`, `src/features/checkout/`, `src/db` (migração + repositório).

## 8.2 Histórico de compras — `feature/historico` (aba Histórico)
- Lista de compras concluídas (data, mercado, total, vs. meta) e detalhe.
- Gráfico de evolução de preço por produto entre visitas (usar skill `dataviz`; `react-native-svg` via `npx expo install`).
- Escopo: `app/(tabs)/historico.tsx`, `src/features/history/`. Depende de 8.1 para ter dados reais (usar seed enquanto isso).

## 8.3 Scanner de código de barras (EAN) — `feature/scanner`
- Leitura pela câmera (`expo-camera`); preencher nome/categoria ao adicionar item e sugerir último preço pago (do histórico).
- **Sem consulta online** (decidido: sem APIs): catálogo **local** — tabela `products` (EAN → nome, categoria, unidade, último preço), alimentada quando o usuário cadastra um produto após escanear; código desconhecido abre o cadastro manual. (Nova migração + repositório em `src/db`.)
- Escopo: `src/features/scanner/`, permissão de câmera em `app.json`.

## 8.4 Ajustes — parte de `feature/checkout` ou branch própria `feature/ajustes`
- Preferências (mercado padrão, meta padrão, feedback tátil), sobre o app, limpar dados (com confirmação).

## Critérios de aceite (todas)
Fluxo completo testado, telas fiéis ao Stitch, `.\scripts\check.ps1` verde, migrações novas com testes.
