const { run, query } = require('../Database')
const { randomUUID } = require('crypto')

function migrate() {
  run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id           TEXT PRIMARY KEY,
      product_id   TEXT NOT NULL,
      product_name TEXT NOT NULL,
      type         TEXT NOT NULL,
      qty          INTEGER NOT NULL,
      prev_stock   INTEGER NOT NULL,
      new_stock    INTEGER NOT NULL,
      date         TEXT NOT NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS categories (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `)

  const catCount = query('SELECT COUNT(*) as c FROM categories')[0]?.c ?? 0
  if (catCount === 0) {
    const defaults = ['Cerveja', 'Refrigerante', 'Água', 'Vinho', 'Destilado', 'Carne', 'Frios', 'Outro']
    for (const name of defaults) {
      run('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [randomUUID(), name])
    }
  }

  run(`
    CREATE TABLE IF NOT EXISTS products (
      id       TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      category TEXT NOT NULL,
      price    REAL NOT NULL,
      unit     TEXT NOT NULL,
      stock    INTEGER NOT NULL DEFAULT 0,
      image    TEXT DEFAULT ''
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS orders (
      id       TEXT PRIMARY KEY,
      client   TEXT NOT NULL,
      status   TEXT NOT NULL DEFAULT 'aberto',
      payment  TEXT DEFAULT '',
      total    REAL NOT NULL DEFAULT 0,
      obs      TEXT DEFAULT '',
      date     TEXT NOT NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id         TEXT PRIMARY KEY,
      order_id   TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name       TEXT NOT NULL,
      qty        INTEGER NOT NULL,
      price      REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)

  const count = query('SELECT COUNT(*) as c FROM products')[0]?.c ?? 0
  if (count === 0) seed()
}

function seed() {
  const products = [
    { id: 'p1', name: 'Cerveja Heineken 600ml', category: 'Cerveja', price: 12.90, unit: 'Garrafa', stock: 48 },
    { id: 'p2', name: 'Brahma Fardo 12un',      category: 'Cerveja', price: 38.00, unit: 'Fardo',   stock: 20 },
    { id: 'p3', name: 'Coca-Cola 2L',            category: 'Refrigerante', price: 9.50, unit: 'Garrafa', stock: 36 },
    { id: 'p4', name: 'Água Crystal cx24',       category: 'Água',  price: 22.00, unit: 'Caixa',   stock: 15 },
  ]
  for (const p of products) {
    run(
      'INSERT OR IGNORE INTO products VALUES (?,?,?,?,?,?,?)',
      [p.id, p.name, p.category, p.price, p.unit, p.stock, '']
    )
  }
}

module.exports = { migrate }
