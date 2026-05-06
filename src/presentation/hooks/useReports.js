import { useState, useCallback } from 'react'
import { reportUseCases } from '../services/reportService'
import { useToast } from '../context/ToastContext'

export function useReports() {
  const [dashboard, setDashboard]     = useState(null)
  const [salesReport, setSalesReport] = useState(null)
  const [loading, setLoading]         = useState(false)
  const showToast = useToast()

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await reportUseCases.dashboard.execute())
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadSalesReport = useCallback(async (range = 'week') => {
    setLoading(true)
    try {
      setSalesReport(await reportUseCases.sales.execute(range))
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  return { dashboard, salesReport, loading, loadDashboard, loadSalesReport }
}
