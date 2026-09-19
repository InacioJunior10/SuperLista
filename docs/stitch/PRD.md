# PRD — SuperLista: Aplicativo de Lista de Compras com Orçamento em Tempo Real

---

## 1. Visão Geral do Produto
O **SuperLista** é um aplicativo mobile focado na experiência de compras em supermercados físicos e feiras, permitindo aos usuários planejar suas listas categorizadas, registrar preços reais na gôndola e acompanhar em tempo real o valor total acumulado antes de chegar ao caixa. O objetivo principal é evitar surpresas financeiras e manter o controle orçamentário durante a jornada de compra.

---

## 2. Personas e Casos de Uso

### Persona Primária: *Juliana, 34 anos — Gestora Familiar*
- **Objetivo:** Fazer compras mensais e semanais sem ultrapassar o teto orçamentário estipulado (ex: R$ 200,00).
- **Dores:** Dificuldade de calcular mentalmente frações de quilos (ex: hortifrúti pesado por quilo), preços promocionais e somas fracionadas com moedas/centavos enquanto empurra o carrinho.
- **Necessidade:** Interface com botões grandes, contraste nítido, fácil digitação com uma mão só e cálculo automático em Real Brasileiro (R$).

---

## 3. Arquitetura da Informação & Telas Desenvolvidas

### 3.1. Tela Principal: Lista de Compras (`SCREEN_4`)
- **Header Superior:**
  - Identificação da lista e mercado selecionado (*Ex: Pão de Açúcar • Hoje*).
  - Ícone de perfil e atalhos rápidos.
- **Card de Orçamento Dinâmico (Hero Summary):**
  - Valor total em Real (`R$ 168,86`) com destaque tipográfico expressivo.
  - Barra de progresso de itens no carrinho (*Ex: 5 de 12 pegos*).
  - Meta de gastos (*Ex: Meta: R$ 200,00*) com alerta visual se aproximar do limite.
  - Botão de recálculo/reset e CTA de adição rápida de itens (`+ Item`).
- **Navegação por Categorias (Chips):**
  - Filtro horizontal rápido: *Todos, Hortifrúti, Laticínios, Padaria, Carnes, Limpeza*.
- **Listagem Agrupada por Seções:**
  - Seções com ícones e contadores de itens (*Ex: Hortifrúti & Feira — 3 itens*).
  - Cada item exibe: checkbox de conferência, nome do produto, detalhe de peso/quantidade e badge de preço com ícone de edição direta.
  - Produtos marcados apresentam riscado sutil e mudança no checkbox.
- **Bottom Navigation Bar:**
  - 4 abas principais: *Lista (ativa)*, *Histórico*, *Carrinho* e *Ajustes*.

### 3.2. Modal de Informar Preço (`SCREEN_2`)
- **Header do Modal:**
  - Tag visual da categoria e nome do produto em foco (*Ex: Tomate Italiano Selecionado*).
  - Botão de fechamento rápido (`X`).
- **Entrada e Exibição de Preço:**
  - Visor do valor calculado no pacote em destaque (`R$ 8,20`).
  - Subtítulo detalhado com fórmula de pesagem: *Pesagem: 0,800 kg × R$ 10,25/kg*.
- **Ajustes Rápidos de Valor:**
  - Chips de incremento ágil de centavos e reais (`+R$ 0,50`, `+R$ 1,00`, `+R$ 2,00`, `+R$ 5,00`) e botão de ação `Zerar`.
- **Seletor de Quantidade / Peso:**
  - Stepper interativo `[-]` `[+]` com indicação de unidades ou gramas.
- **Ação de Carrinho:**
  - Toggle / Checkbox *"Marcar como pego no carrinho"*, que ao ser marcado já soma imediatamente ao total do cabeçalho da lista.
- **Rodapé de Ações:**
  - Botão secundário `Sair` (fecha sem salvar alterações pendentes).
  - Botão primário `Salvar Preço` (grava o valor, atualiza o item e recalcula o total).

---

## 4. Requisitos Funcionais (FR)

| ID | Requisito | Descrição |
|---|---|---|
| **RF-01** | Totalização em Tempo Real | A soma total no topo deve recalcular instantaneamente quando um preço for salvo ou item for marcado. |
| **RF-02** | Máscara Monetária (BRL) | Inputs e exibições financeiras devem seguir o padrão brasileiro `R$ 0,00`. |
| **RF-03** | Agrupamento por Categorias | Os itens devem ser ordenados por seções padronizadas de supermercado (Hortifrúti, Carnes, etc.). |
| **RF-04** | Pesagem e Quantidade | Suporte a cálculos de preço unitário por quilo (`kg`) ou por unidade (`un`). |
| **RF-05** | Edição Rápida via Modal | Tocar em qualquer valor ou item abre o bottom sheet/modal sem sair do contexto da lista. |
| **RF-06** | Meta de Orçamento | O usuário pode definir um valor teto para a compra; a barra de progresso avisa a proximidade do teto. |

---

## 5. Requisitos Não Funcionais (NFR)

- **Usabilidade em Loja:** Elementos de toque com área mínima de 44x44px e tipografia legível sob luz fluorescente ou em movimento.
- **Performance:** Tempo de resposta < 100ms para abertura do modal de preço e recálculo da soma.
- **Offline First:** A aplicação deve funcionar 100% sem internet dentro do mercado, sincronizando em segundo plano quando conectada.

---

## 6. Identidade Visual e Design System

- **Nome do Sistema:** Fresh Market Grotesk (`DESIGN_SYSTEM_1`)
- **Cor Primária:** `#00A86B` (Verde Esmeralda Fresco — transmite economia, frescor e clareza financeira).
- **Tipografia:** Plus Jakarta Sans (geométrica, moderna e legível em números e valores).
- **Bordas e Formas:** Cantos arredondados suaves (`rounded-2xl` para cards e modais).
- **Modo:** Light Mode de alto contraste.

---

## 7. Próximos Passos & Telas Futuras Recomendadas
1. **Tela de Carrinho Finalizado / Checkout:** Resumo com recibo estimado, divisão por métodos de pagamento e comparativo com a meta.
2. **Tela de Histórico de Compras:** Gráfico de evolução de preços entre visitas aos supermercados.
3. **Scanner de Código de Barras (Leitor EAN):** Consulta automática de preço na gôndola via câmera do smartphone.
