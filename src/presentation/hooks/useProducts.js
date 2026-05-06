import { useState, useCallback } from 'react'
import { productUseCases } from '../services/productService'
import { useToast } from '../context/ToastContext'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(false)
  const showToast = useToast()

  const load = useCallback(async (search = '') => {
    setLoading(true)
    try {
      setProducts(await productUseCases.list.execute(search))
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const save = useCallback(async (data) => {
    try {
      if (data.id) {
        await productUseCases.update.execute(data)
        showToast(`${data.name} atualizado!`)
      } else {
        await productUseCases.create.execute(data)
        showToast(`${data.name} cadastrado!`)
      }
      await load()
      return true
    } catch (e) {
      showToast(e.message, 'error')
      return false
    }
  }, [load, showToast])

  const remove = useCallback(async (id, name) => {
    try {
      await productUseCases.delete.execute(id)
      showToast(`${name} removido!`)
      await load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [load, showToast])

  return { products, loading, load, save, remove }
}
