const { query, run, saveDatabase } = require('../database/Database')
const { buildOrdersWithItems }     = require('../database/orderQueries')
const crypto = require('crypto')

function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (e) {
      console.error('[IPC orders error]', e.message)
      throw e
    }
  }
}

function registerOrderHandlers(ipcMain) {
  ipcMain.handle('orders:list', withErrorHandling(() => {
    const rows = query('SELECT * FROM orders ORDER BY date DESC')
    return buildOrdersWithItems(rows)
  }))

  ipcMain.handle('orders:findById', withErrorHandling((_, id) => {
    const rows = query('SELECT * FROM orders WHERE id = ?', [id])
    if (!rows.length) return null
    return buildOrdersWithItems(rows)[0]
  }))

  ipcMain.handle('orders:save', withErrorHandling((_, order) => {
    run(
      `INSERT INTO orders (id, client, status, payment, total, obs, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order.id, order.client, order.status ?? 'aberto',
       order.payment ?? '', order.total, order.obs ?? '', order.date]
    )
    for (const item of order.items ?? []) {
      run(
        `INSERT INTO order_items (id, order_id, product_id, name, qty, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), order.id, item.productId, item.name, item.qty, item.price]
      )
    }
    saveDatabase()
    return { success: true }
  }))

  ipcMain.handle('orders:update', withErrorHandling((_, order) => {
    run(
      `UPDATE orders SET client=?, status=?, payment=?, total=?, obs=? WHERE id=?`,
      [order.client, order.status, order.payment ?? '', order.total, order.obs ?? '', order.id]
    )
    run('DELETE FROM order_items WHERE order_id = ?', [order.id])
    for (const item of order.items ?? []) {
      run(
        `INSERT INTO order_items (id, order_id, product_id, name, qty, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), order.id, item.productId, item.name, item.qty, item.price]
      )
    }
    saveDatabase()
    return { success: true }
  }))

  ipcMain.handle('orders:updateStatus', withErrorHandling((_, id, status, payment) => {
    if (payment !== undefined) {
      run('UPDATE orders SET status=?, payment=? WHERE id=?', [status, payment, id])
    } else {
      run('UPDATE orders SET status=? WHERE id=?', [status, id])
    }
    saveDatabase()
    return { success: true }
  }))

  ipcMain.handle('orders:delete', withErrorHandling((_, id) => {
    run('DELETE FROM orders WHERE id = ?', [id])
    saveDatabase()
    return { success: true }
  }))
}

module.exports = { registerOrderHandlers }
