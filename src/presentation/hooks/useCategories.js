import { useState, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { categoryService } from '../services/categoryService'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const showToast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCategories(await categoryService.list())
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const save = useCallback(async (data) => {
    try {
      await categoryService.save(data)
      showToast(data.name + (data.isNew ? ' criada!' : ' atualizada!'))
      await load()
      return true
    } catch (e) {
      showToast(e.message, 'error')
      return false
    }
  }, [load, showToast])

  const remove = useCallback(async (id, name) => {
    try {
      await categoryService.delete(id)
      showToast(`"${name}" removida!`)
      await load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [load, showToast])

  return { categories, loading, load, save, remove }
}
