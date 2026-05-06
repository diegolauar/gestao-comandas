const { app, BrowserWindow, protocol, net } = require('electron')
const path = require('path')
const fs   = require('fs')
const { randomUUID }         = require('crypto')
const { initDatabase, saveDatabase, query, run } = require('../infrastructure/database/Database')
const { migrate }            = require('../infrastructure/database/migrations/migrate')
const { registerAllHandlers }= require('../infrastructure/container')

// Suprime erro de permissão do cache de GPU no Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')

// Deve ser chamado antes de app.whenReady()
protocol.registerSchemesAsPrivileged([
  { scheme: 'app-img', privileges: { secure: true, standard: true, supportFetchAPI: true } },
])

const isDev = !app.isPackaged

function migrateImagesToFiles(userDataPath) {
  try {
    const imagesDir = path.join(userDataPath, 'images')
    const products  = query("SELECT id, image FROM products WHERE image LIKE 'data:%'")
    if (products.length === 0) return

    fs.mkdirSync(imagesDir, { recursive: true })
    for (const p of products) {
      try {
        const match    = p.image.match(/^data:image\/(\w+);base64,/)
        const ext      = match?.[1] === 'jpeg' ? 'jpg' : (match?.[1] || 'png')
        const filename = `${randomUUID()}.${ext}`
        const data     = p.image.replace(/^data:[^;]+;base64,/, '')
        fs.writeFileSync(path.join(imagesDir, filename), Buffer.from(data, 'base64'))
        run('UPDATE products SET image = ? WHERE id = ?', [filename, p.id])
      } catch (e) {
        console.error('Falha ao migrar imagem do produto', p.id, e)
      }
    }
    saveDatabase()
  } catch (e) {
    console.error('Migração de imagens ignorada (sem permissão ou erro de I/O):', e.message)
  }
}

async function bootstrap() {
  const userDataPath = app.getPath('userData')
  await initDatabase(userDataPath)
  migrate()
  migrateImagesToFiles(userDataPath)
  registerAllHandlers()
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '../../assets/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  app.on('before-quit', () => saveDatabase())
}

app.whenReady().then(async () => {
  protocol.handle('app-img', async (request) => {
    try {
      const imgName = decodeURIComponent(request.url.replace('app-img://', ''))
      if (!imgName) return new Response(null, { status: 404 })
      const imgPath = path.join(app.getPath('userData'), 'images', imgName)
      if (!fs.existsSync(imgPath)) return new Response(null, { status: 404 })
      return await net.fetch('file:///' + imgPath.replace(/\\/g, '/'))
    } catch {
      return new Response(null, { status: 404 })
    }
  })

  await bootstrap()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
