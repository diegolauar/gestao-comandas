import { createContext, useContext, useState, useMemo, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [page,         setPage]         = useState('dashboard')
  const [editingOrder, setEditingOrder] = useState(null)
  const [orders,       setOrders]       = useState([])

  const navigate = useCallback((pageName, data = null) => {
    setEditingOrder(data)
    setPage(pageName)
  }, [])

  const openOrderCount = useMemo(
    () => orders.filter(o => o.status === 'aberto').length,
    [orders]
  )

  return (
    <AppContext.Provider value={{ page, navigate, editingOrder, setOrders, openOrderCount }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
