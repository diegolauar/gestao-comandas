const { query, run, saveDatabase } = require('../database/Database')

function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (e) {
      console.error('[IPC products error]', e.message)
      throw e
    }
  }
}

function registerProductHandlers(ipcMain) {
  ipcMain.handle('products:list', withErrorHandling(() => {
    return query('SELECT * FROM products ORDER BY name')
  }))

  ipcMain.handle('products:findById', withErrorHandling((_, id) => {
    const rows = query('SELECT * FROM products WHERE id = ?', [id])
    return rows[0] ?? null
  }))

  ipcMain.handle('products:findByIds', withErrorHandling((_, ids) => {
    if (!ids?.length) return []
    const placeholders = ids.map(() => '?').join(',')
    return query(`SELECT * FROM products WHERE id IN (${placeholders})`, ids)
  }))

  ipcMain.handle('products:save', withErrorHandling((_, product) => {
    run(
      `INSERT OR REPLACE INTO products (id, name, category, price, unit, stock, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product.id, product.name, product.category, product.price,
       product.unit, product.stock, product.image ?? '']
    )
    saveDatabase()
    return { success: true }
  }))

  ipcMain.handle('products:delete', withErrorHandling((_, id) => {
    run('DELETE FROM products WHERE id = ?', [id])
    saveDatabase()
    return { success: true }
  }))
}

module.exports = { registerProductHandlers }
