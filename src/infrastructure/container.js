const { ipcMain }                   = require('electron')
const { registerProductHandlers }   = require('./ipc/productsHandlers')
const { registerOrderHandlers }     = require('./ipc/ordersHandlers')
const { registerBackupHandlers }    = require('./ipc/backupHandlers')
const { registerDialogHandlers }    = require('./ipc/dialogHandlers')
const { registerCategoryHandlers }  = require('./ipc/categoriesHandlers')
const { registerImageHandlers }          = require('./ipc/imagesHandlers')
const { registerStockMovementsHandlers } = require('./ipc/stockMovementsHandlers')

function registerAllHandlers() {
  registerProductHandlers(ipcMain)
  registerOrderHandlers(ipcMain)
  registerBackupHandlers(ipcMain)
  registerDialogHandlers(ipcMain)
  registerCategoryHandlers(ipcMain)
  registerImageHandlers(ipcMain)
  registerStockMovementsHandlers(ipcMain)
}

module.exports = { registerAllHandlers }
