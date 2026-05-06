const { dialog } = require('electron')

function registerDialogHandlers(ipcMain) {
  ipcMain.handle('dialog:saveFile', (_, { title, defaultPath, filters }) => {
    return dialog.showSaveDialogSync({ title, defaultPath, filters }) ?? null
  })

  ipcMain.handle('dialog:openFile', (_, { title, filters }) => {
    const paths = dialog.showOpenDialogSync({ title, filters, properties: ['openFile'] })
    return paths?.[0] ?? null
  })
}

module.exports = { registerDialogHandlers }
