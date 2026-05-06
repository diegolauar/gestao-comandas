const path = require('path')
const fs   = require('fs')

let db     = null
let dbPath = null

function getWasmDir() {
  try {
    const { app } = require('electron')
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'sql.js', 'dist')
    }
  } catch {}
  return path.join(__dirname, '..', '..', '..', 'node_modules', 'sql.js', 'dist')
}

async function initDatabase(userDataPath) {
  dbPath = path.join(userDataPath, 'k2emporium.db')

  const initSqlJs = require('sql.js')
  const wasmDir   = getWasmDir()

  const SQL = await initSqlJs({
    locateFile: file => path.join(wasmDir, file),
  })

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  return db
}

function saveDatabase() {
  if (!db || !dbPath) return
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function getDb() { return db }

function query(sql, params = []) {
  const stmt = db.prepare(sql)
  const rows = []
  stmt.bind(params)
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function run(sql, params = []) {
  db.run(sql, params)
}

module.exports = { initDatabase, saveDatabase, getDb, query, run }
