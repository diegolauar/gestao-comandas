const { randomUUID } = require('crypto')
const { query, run, saveDatabase } = require('../database/Database')

function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (e) {
      console.error('[IPC stock_movements error]', e.message)
      throw e
    }
  }
}

function registerStockMovementsHandlers(ipcMain) {
  ipcMain.handle('stock_movements:record', withErrorHandling((_, data) => {
    run(
      `INSERT INTO stock_movements (id, product_id, product_name, type, qty, prev_stock, new_stock, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), data.productId, data.productName, data.type,
       data.qty, data.prevStock, data.newStock, new Date().toISOString()]
    )
    saveDatabase()
  }))

  ipcMain.handle('stock_movements:list', withErrorHandling((_, productId) => {
    return query(
      'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY date DESC LIMIT 20',
      [productId]
    )
  }))
}

module.exports = { registerStockMovementsHandlers }
