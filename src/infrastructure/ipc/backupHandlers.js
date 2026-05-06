const { dialog } = require('electron')
const fs         = require('fs')
const crypto     = require('crypto')
const { query, run, saveDatabase } = require('../database/Database')
const { buildOrdersWithItems }     = require('../database/orderQueries')
const { JsonExporter }  = require('../exporters/JsonExporter')
const { ExcelExporter } = require('../exporters/ExcelExporter')

const pad = n => String(n).padStart(2, '0')
const todayLabel = () => {
  const d = new Date()
  return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`
}
const monthLabel = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}`
}

function getFilteredOrders(type) {
  const all = query('SELECT * FROM orders ORDER BY date DESC')
  const now = new Date()
  if (type === 'today') {
    const today = now.toDateString()
    return all.filter(o => new Date(o.date).toDateString() === today)
  }
  if (type === 'month') {
    return all.filter(o => {
      const d = new Date(o.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
  }
  return all
}

function registerBackupHandlers(ipcMain) {
  ipcMain.handle('backup:export', async (_, { type = 'all', format = 'json' }) => {
    try {
      const ext = format === 'excel' ? 'xlsx' : 'json'
      const defaultName = `K2_${type === 'today' ? todayLabel() : type === 'month' ? monthLabel() : 'completo'}.${ext}`

      const filePath = dialog.showSaveDialogSync({
        title: 'Salvar backup',
        defaultPath: defaultName,
        filters: format === 'excel'
          ? [{ name: 'Excel', extensions: ['xlsx'] }]
          : [{ name: 'JSON', extensions: ['json'] }],
      })

      if (!filePath) return { success: false, cancelled: true }

      const orders         = buildOrdersWithItems(getFilteredOrders(type))
      const products       = query('SELECT * FROM products ORDER BY name')
      const categories     = query('SELECT * FROM categories ORDER BY name')
      const stockMovements = query('SELECT * FROM stock_movements ORDER BY date DESC')

      const data = {
        meta: {
          tipo: type === 'today' ? 'backup_diario' : type === 'month' ? 'backup_mensal' : 'backup_completo',
          loja: 'K2 Emporium',
          geradoEm: new Date().toISOString(),
        },
        orders,
        products,
        categories,
        stockMovements,
      }

      const exporter = format === 'excel' ? new ExcelExporter() : new JsonExporter()
      await exporter.export(data, filePath)

      return { success: true, filePath, totalOrders: orders.length }
    } catch (e) {
      console.error('[IPC backup:export error]', e.message)
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('backup:import', async () => {
    try {
      const paths = dialog.showOpenDialogSync({
        title: 'Selecionar backup',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      })
      if (!paths?.length) return { success: false, cancelled: true }

      let data
      try {
        data = JSON.parse(fs.readFileSync(paths[0], 'utf-8'))
      } catch {
        return { success: false, error: 'Arquivo inválido ou corrompido' }
      }

      const existingOrders   = new Set(query('SELECT id FROM orders').map(r => r.id))
      const existingProducts = new Set(query('SELECT id FROM products').map(r => r.id))

      let importedOrders = 0, importedProducts = 0

      for (const order of data.orders ?? []) {
        if (existingOrders.has(order.id)) continue
        run(
          `INSERT INTO orders (id, client, status, payment, total, obs, date) VALUES (?,?,?,?,?,?,?)`,
          [order.id, order.client, order.status, order.payment ?? '', order.total, order.obs ?? '', order.date]
        )
        for (const item of order.items ?? []) {
          run(
            `INSERT INTO order_items (id, order_id, product_id, name, qty, price) VALUES (?,?,?,?,?,?)`,
            [crypto.randomUUID(), order.id, item.productId, item.name, item.qty, item.price]
          )
        }
        importedOrders++
      }

      for (const product of data.products ?? []) {
        if (existingProducts.has(product.id)) continue
        run(
          `INSERT INTO products (id, name, category, price, unit, stock, image) VALUES (?,?,?,?,?,?,?)`,
          [product.id, product.name, product.category, product.price, product.unit, product.stock, product.image ?? '']
        )
        importedProducts++
      }

      const existingCategories = new Set(query('SELECT name FROM categories').map(r => r.name))
      let importedCategories = 0
      for (const cat of data.categories ?? []) {
        if (existingCategories.has(cat.name)) continue
        run('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [cat.id ?? crypto.randomUUID(), cat.name])
        importedCategories++
      }

      const existingMovements = new Set(query('SELECT id FROM stock_movements').map(r => r.id))
      let importedMovements = 0
      for (const m of data.stockMovements ?? []) {
        if (existingMovements.has(m.id)) continue
        run(
          `INSERT INTO stock_movements (id, product_id, product_name, type, qty, prev_stock, new_stock, date) VALUES (?,?,?,?,?,?,?,?)`,
          [m.id, m.product_id, m.product_name, m.type, m.qty, m.prev_stock, m.new_stock, m.date]
        )
        importedMovements++
      }

      saveDatabase()
      return { success: true, importedOrders, importedProducts, importedCategories, importedMovements }
    } catch (e) {
      console.error('[IPC backup:import error]', e.message)
      return { success: false, error: e.message }
    }
  })
}

module.exports = { registerBackupHandlers }
