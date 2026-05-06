const { app } = require('electron')
const { randomUUID } = require('crypto')
const path = require('path')
const fs   = require('fs')

const MAX_SIZE_BYTES = 2 * 1024 * 1024

function registerImageHandlers(ipcMain) {
  ipcMain.handle('images:save', async (_, { dataUrl }) => {
    try {
      const match = dataUrl?.match(/^data:(image\/[^;]+);base64,/)
      if (!match) throw new Error('Formato de imagem inválido')

      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '')
      const estimatedBytes = (base64Data.length * 3) / 4
      if (estimatedBytes > MAX_SIZE_BYTES) {
        throw new Error('Imagem muito grande. Tamanho máximo: 2MB')
      }

      const imagesDir = path.join(app.getPath('userData'), 'images')
      fs.mkdirSync(imagesDir, { recursive: true })

      const mimeType = match[1]
      const extRaw   = mimeType.split('/')[1].replace(/[^a-z0-9]/gi, '')
      const ext      = ['jpeg', 'jfif', 'jpe', 'jif'].includes(extRaw) ? 'jpg' : extRaw || 'jpg'
      const filename = `${randomUUID()}.${ext}`
      fs.writeFileSync(path.join(imagesDir, filename), Buffer.from(base64Data, 'base64'))

      return filename
    } catch (e) {
      console.error('[IPC images:save error]', e.message)
      throw e
    }
  })
}

module.exports = { registerImageHandlers }
