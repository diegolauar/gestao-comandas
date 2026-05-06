import { useState, useCallback } from 'react'
import { orderUseCases } from '../services/orderService'
import { useToast } from '../context/ToastContext'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const showToast = useToast()

  const load = useCallback(async (filters = {}) => {
    setLoading(true)
    try {
      setOrders(await orderUseCases.list.execute(filters))
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const create = useCallback(async (data) => {
    try {
      const order = await orderUseCases.create.execute(data)
      showToast('Comanda aberta!')
      return order
    } catch (e) {
      showToast(e.message, 'error')
      return null
    }
  }, [showToast])

  const update = useCallback(async (data) => {
    try {
      await orderUseCases.update.execute(data)
      showToast('Pedido atualizado!')
      await load()
      return true
    } catch (e) {
      showToast(e.message, 'error')
      return false
    }
  }, [load, showToast])

  const updateStatus = useCallback(async (id, status) => {
    try {
      await orderUseCases.updateStatus.execute(id, status)
      showToast('Status atualizado!')
      await load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [load, showToast])

  const finalize = useCallback(async (id, payment) => {
    try {
      await orderUseCases.finalize.execute(id, payment)
      showToast('Comanda fechada!')
      await load()
      return true
    } catch (e) {
      showToast(e.message, 'error')
      return false
    }
  }, [load, showToast])

  const remove = useCallback(async (id) => {
    try {
      await orderUseCases.delete.execute(id)
      showToast('Comanda removida!')
      await load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [load, showToast])

  return { orders, loading, load, create, update, updateStatus, finalize, remove }
}
