const { query, run, saveDatabase } = require('../database/Database')

function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (e) {
      console.error('[IPC categories error]', e.message)
      throw e
    }
  }
}

function registerCategoryHandlers(ipcMain) {
  ipcMain.handle('categories:list', withErrorHandling(() => {
    return query('SELECT * FROM categories ORDER BY name')
  }))

  ipcMain.handle('categories:save', withErrorHandling((_, category) => {
    run(
      'INSERT OR REPLACE INTO categories (id, name) VALUES (?, ?)',
      [category.id, category.name]
    )
    saveDatabase()
    return { success: true }
  }))

  ipcMain.handle('categories:delete', withErrorHandling((_, id) => {
    const cat = query('SELECT name FROM categories WHERE id = ?', [id])[0]
    if (cat) {
      const inUse = query('SELECT COUNT(*) as c FROM products WHERE category = ?', [cat.name])[0]?.c ?? 0
      if (inUse > 0) throw new Error(`"${cat.name}" está em uso por ${inUse} produto(s). Remova ou altere os produtos antes.`)
    }
    run('DELETE FROM categories WHERE id = ?', [id])
    saveDatabase()
    return { success: true }
  }))
}

module.exports = { registerCategoryHandlers }
