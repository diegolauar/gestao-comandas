import { ToastProvider } from './context/ToastContext'
import { AppProvider, useApp } from './context/AppContext'
import { Sidebar }        from './components/Sidebar'
import DashboardPage      from './pages/DashboardPage'
import ProductsPage       from './pages/ProductsPage'
import OrdersPage         from './pages/OrdersPage'
import NewOrderPage       from './pages/NewOrderPage'
import EditOrderPage      from './pages/EditOrderPage'
import ReportsPage        from './pages/ReportsPage'
import BackupPage         from './pages/BackupPage'
import CategoriesPage     from './pages/CategoriesPage'

function AppContent() {
  const { page } = useApp()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {page === 'dashboard' && <DashboardPage />}
        {page === 'products'   && <ProductsPage />}
        {page === 'categories' && <CategoriesPage />}
        {page === 'orders'    && <OrdersPage />}
        {page === 'neworder'  && <NewOrderPage />}
        {page === 'editorder' && <EditOrderPage />}
        {page === 'reports'   && <ReportsPage />}
        {page === 'backup'    && <BackupPage />}
      </main>
    </div>
  )
}

const App = () => (
  <ToastProvider>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </ToastProvider>
)

export default App
