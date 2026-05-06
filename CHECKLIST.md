# K2 Emporium — Checklist de Desenvolvimento

## Stack
- **Desktop:** Electron
- **Frontend:** React + Vite
- **Banco:** SQLite (sql.js — pure JS, sem compilação nativa)
- **Exportação:** JSON + Excel (exceljs)
- **Build/Instalador:** electron-builder
- **Arquitetura:** Clean Architecture + SOLID + Design Patterns

## Estrutura de pastas alvo
```
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── errors/
├── application/
│   ├── ports/
│   ├── use-cases/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── reports/
│   │   └── backup/
│   └── dtos/
├── infrastructure/
│   ├── database/
│   │   ├── sqlite/
│   │   └── migrations/
│   ├── exporters/
│   └── ipc/
├── presentation/
│   ├── design-system/
│   │   ├── tokens/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   └── services/
├── main/
│   ├── main.js
│   ├── preload.js
│   └── container.js
└── assets/
    └── logo.png  ✅ (já copiado)
```

---

## FASE 0 — Setup do Projeto ✅ CONCLUÍDA
- [x] Criar `package.json` com nome, versão, scripts
- [x] Instalar dependências de produção:
  - [x] `electron`
  - [x] `react` + `react-dom`
  - [x] `sql.js` (SQLite pure JS — sem compilação nativa)
  - [x] `exceljs`
- [x] Instalar dependências de desenvolvimento:
  - [x] `vite` + `@vitejs/plugin-react`
  - [x] `electron-builder`
  - [x] `eslint` + `prettier`
  - [x] `concurrently` (rodar Vite + Electron juntos em dev)
- [x] Configurar `vite.config.js` para o renderer
- [x] Configurar `jsconfig.json` com path aliases:
  - `@domain`, `@application`, `@infra`, `@presentation`, `@assets`
- [x] Configurar `.eslintrc` e `.prettierrc`
- [x] Criar todos os diretórios da estrutura acima
- [x] Configurar scripts no `package.json`:
  - `dev` → Vite + Electron em paralelo
  - `build` → build de produção
  - `dist` → gera instalador .exe
- [x] `index.html` + `src/presentation/main.jsx` (entry points)
- [x] `src/presentation/styles/global.css` (paleta dourada, tokens CSS)
- [x] `src/main/main.js` (Electron — janela, lifecycle)
- [x] `src/main/preload.js` (contextBridge — window.api completo)
- [x] `.gitignore`
- [x] Build testado com sucesso (`vite build` ✅)

---

## FASE 1 — UI Compartilhada ✅ CONCLUÍDA
> Abordagem simplificada: um arquivo de tema + um arquivo de componentes

- [x] `src/presentation/styles/theme.js` — cores, categoryColors, statusColors, objetos de estilo (S.card, S.btn, S.input, S.badge...)
- [x] `src/presentation/components/UI.jsx` — todos os componentes reutilizáveis:
  - [x] `Icon` — todos os SVGs do sistema
  - [x] `Field` — label + children
  - [x] `StatusBadge` — aberto | entregue | cancelado
  - [x] `CategoryBadge` — Cerveja, Carne, Frios, etc.
  - [x] `Modal` — título, conteúdo, onClose
  - [x] `ConfirmDialog` — confirmação com ícone de alerta
  - [x] `Toast` — notificação bottom-right
  - [x] `PageHeader` — título + subtítulo + ação
  - [x] `EmptyState` — estado vazio de listas
  - [x] `StatCard` — card de estatística (dashboard)

---

## FASE 2 — Domain Layer ✅ CONCLUÍDA

### Entities
- [x] `Product` — id, name, category, price, unit, stock, image + CATEGORIES + UNITS + deductStock + returnStock
- [x] `Order` — id, client, status, payment, items, total (calculado), obs, date + changeStatus + updateItems
- [x] `OrderItem` — productId, name, qty, price + subtotal (calculado)

### Value Objects
- [x] `Money` — encapsula valor, formata em BRL, operações add/multiply
- [x] `OrderStatus` — aberto | entregue | cancelado + isOpen/isDelivered/isCancelled

### Errors
- [x] `DomainError` — classe base
- [x] `InsufficientStockError` — estoque insuficiente (productName, available, requested)
- [x] `ValidationError` — campo + motivo
- [x] `NotFoundError` — entidade + id

---

## FASE 3 — Application Layer ✅ CONCLUÍDA

### Ports (Interfaces)
- [x] `IProductRepository` — findAll, findById, save, delete
- [x] `IOrderRepository` — findAll, findById, save, update, delete
- [x] `IExporter` — export(data, filePath)

### Use Cases — Produtos
- [x] `CreateProductUseCase`
- [x] `UpdateProductUseCase`
- [x] `DeleteProductUseCase`
- [x] `ListProductsUseCase` — com filtro de busca

### Use Cases — Pedidos
- [x] `CreateOrderUseCase` — cria pedido + baixa de estoque
- [x] `UpdateOrderUseCase` — edição completa + reverte estoque antigo + aplica novo
- [x] `UpdateOrderStatusUseCase` — só muda status
- [x] `DeleteOrderUseCase` — exclui pedido + devolve estoque
- [x] `ListOrdersUseCase` — filtro por status e busca por cliente

### Use Cases — Relatórios
- [x] `GetDashboardStatsUseCase` — vendas hoje, pedidos abertos, estoque baixo, últimos pedidos
- [x] `GetSalesReportUseCase` — top produtos, formas de pagamento, gráfico 7 dias (range: today/week/month/all)

### Use Cases — Backup
- [x] `ExportDataUseCase` — recebe IExporter (JSON ou Excel), filtra por tipo (today/month/all)
- [x] `ImportDataUseCase` — importa pedidos e produtos novos (ignora duplicados)

### DTOs
- [x] `toProductDTO` — mapper produto → objeto plano
- [x] `toOrderDTO` — mapper pedido → objeto plano (status.value, subtotal calculado)

---

## FASE 4 — Infrastructure Layer ✅ CONCLUÍDA

### Banco de dados (sql.js — main process, CommonJS)
- [x] `Database.js` — init sql.js, load/save do arquivo .db, helpers query() e run()
- [x] `migrations/migrate.js` — CREATE TABLE IF NOT EXISTS (products, orders, order_items) + seed na 1ª execução

### Repositories (renderer, ESM — reconstroem entidades de domínio)
- [x] `IPCProductRepository` — implementa IProductRepository via window.api
- [x] `IPCOrderRepository` — implementa IOrderRepository via window.api

### Exporters (main process, CommonJS)
- [x] `JsonExporter` — escreve arquivo JSON
- [x] `ExcelExporter` — escreve Excel com abas Pedidos, Produtos e Resumo (dourado no cabeçalho)

### IPC Handlers (main process, CommonJS)
- [x] `productsHandlers.js` — list, findById, save (INSERT OR REPLACE), delete
- [x] `ordersHandlers.js` — list, findById, save, update, updateStatus (aceita payment), delete
- [x] `backupHandlers.js` — export JSON/Excel com dialog nativo, import com dialog nativo
- [x] `dialogHandlers.js` — saveFile, openFile

### Container e wiring
- [x] `container.js` — registra todos os handlers IPC
- [x] `main.js` — inicializa banco → migrate → registerAllHandlers → cria janela
- [x] `preload.js` — contextBridge completo (products, orders, backup, dialog)

---

## FASE 5 — Electron Shell

- [ ] `main.js` — criar BrowserWindow, lifecycle, menu oculto
- [ ] Janela abre maximizada por padrão
- [ ] `preload.js` — expor `window.api` via `contextBridge`:
  - `window.api.products.*`
  - `window.api.orders.*`
  - `window.api.reports.*`
  - `window.api.backup.*`
  - `window.api.dialog.*` (salvar/abrir arquivo)
- [ ] Dialog nativo para exportação (save) e importação (open)

---

## FASE 6 — Presentation Layer ✅ CONCLUÍDA

### Services
- [x] `productService.js` — instancia use cases com IPCProductRepository
- [x] `orderService.js` — instancia use cases com IPC repos (inclui FinalizeOrderUseCase)
- [x] `reportService.js` — instancia use cases de relatórios

### Context
- [x] `ToastContext.jsx` — ToastProvider + useToast hook global

### Hooks
- [x] `useProducts.js` — load, save (create/update), remove
- [x] `useOrders.js` — load, create, update, updateStatus, finalize, remove
- [x] `useReports.js` — loadDashboard, loadSalesReport

### Pages
- [x] `DashboardPage` — 4 stat cards + comandas de hoje + estoque baixo
- [x] `ProductsPage` — grid + CRUD completo (modal criar/editar/deletar + foto)
- [x] `OrdersPage` — tabela + filtros + modal detalhe + Fechar Comanda + cancelar + editar + deletar
- [x] `NewOrderPage` — abre comanda SEM pagamento (fluxo de comanda)
- [x] `EditOrderPage` — edita itens/cliente/obs com reajuste de estoque
- [x] `ReportsPage` — KPIs + gráfico 7 dias + pagamentos + top produtos
- [x] `BackupPage` — export JSON/Excel (hoje/mês/tudo) + import

### Componentes e Navegação
- [x] `Sidebar.jsx` — logo K2, nav com badge de comandas abertas, data no rodapé
- [x] `App.jsx` — ToastProvider + Sidebar + roteamento por estado

---

## FASE 7 — Assets e Ícone ✅ CONCLUÍDA

- [x] Logo PNG com fundo transparente copiada para `assets/logo.png`
- [x] Script `scripts/generate-icon.js` — usa jimp (redimensiona para 256x256 quadrado) + png-to-ico
- [x] `assets/icon.ico` gerado (279KB, multi-resolução)
- [x] Ícone configurado em `main.js` e em `electron-builder` (package.json)
- [x] `npm run icon` — regenera o .ico a qualquer momento

---

## FASE 8 — Build e Distribuição

- [x] `electron-builder` configurado no `package.json`:
  - Nome: K2 Emporium, Ícone, NSIS em pt-BR, asarUnpack do sql.js WASM
- [x] `npm run build` (vite build) — ✅ passando (81 módulos)
- [ ] `npm run dist` — **requer terminal como Administrador no Windows**
  - Comando: `$env:CSC_IDENTITY_AUTO_DISCOVERY="false"; npm run dist`
  - Gera: `release/K2 Emporium Setup 1.0.0.exe`
- [ ] Instalar o `.exe` em uma máquina limpa e testar tudo
- [ ] Verificar que dados persistem após fechar e reabrir o app

---

## Categorias de Produto (expandidas)
- Cerveja
- Refrigerante
- Água
- Vinho
- Destilado
- Carne
- Frios
- Outro

## Formas de Pagamento
- Dinheiro
- PIX
- Cartão de Débito
- Cartão de Crédito

---

## Notas importantes
- `UpdateOrderUseCase`: ao editar um pedido, reverter estoque dos itens antigos antes de aplicar os novos
- `DeleteOrderUseCase`: ao deletar, devolver estoque de todos os itens do pedido
- Paleta dourada: accent `#D4AF37`, fundo `#0a0a0a`
- Logo: `assets/logo.png` (PNG fundo transparente)
- O amigo não sabe programação — interface deve ser simples e clara

## Regra de negócio — Fluxo de Comanda ✅ IMPLEMENTADO
- Pedido é aberto SEM forma de pagamento (campo `payment` nasce como `''`)
- Garçom anota cliente + itens → baixa de estoque acontece na criação
- Ao fechar a comanda (cliente vai pagar): seleciona PIX/Dinheiro/Cartão → `FinalizeOrderUseCase`
- `Order.finalize(payment)` valida pagamento e muda status para "entregue" no domínio
- Na UI: botão "Fechar Comanda" no modal de detalhe abre seletor de pagamento
- `orders:finalize` no preload é atalho para `orders:updateStatus(id, 'entregue', payment)`
