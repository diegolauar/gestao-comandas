const { query } = require('./Database')

function buildOrdersWithItems(orderRows) {
  if (!orderRows.length) return []
  const placeholders = orderRows.map(() => '?').join(',')
  const ids   = orderRows.map(o => o.id)
  const items = query(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, ids)

  const itemsByOrder = {}
  for (const item of items) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
    itemsByOrder[item.order_id].push({
      productId: item.product_id,
      name:      item.name,
      qty:       item.qty,
      price:     item.price,
    })
  }

  return orderRows.map(o => ({ ...o, items: itemsByOrder[o.id] ?? [] }))
}

module.exports = { buildOrdersWithItems }
