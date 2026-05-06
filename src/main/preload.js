const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  products: {
    list:     ()         => ipcRenderer.invoke('products:list'),
    findById:  (id)       => ipcRenderer.invoke('products:findById', id),
    findByIds: (ids)      => ipcRenderer.invoke('products:findByIds', ids),
    save:      (product)  => ipcRenderer.invoke('products:save', product),
    delete:   (id)       => ipcRenderer.invoke('products:delete', id),
  },
  orders: {
    list:         ()                => ipcRenderer.invoke('orders:list'),
    findById:     (id)              => ipcRenderer.invoke('orders:findById', id),
    save:         (order)           => ipcRenderer.invoke('orders:save', order),
    update:       (order)           => ipcRenderer.invoke('orders:update', order),
    updateStatus: (id, status, pay) => ipcRenderer.invoke('orders:updateStatus', id, status, pay),
    finalize:     (id, payment)     => ipcRenderer.invoke('orders:updateStatus', id, 'entregue', payment),
    delete:       (id)              => ipcRenderer.invoke('orders:delete', id),
  },
  backup: {
    export: (opts)  => ipcRenderer.invoke('backup:export', opts),
    import: ()      => ipcRenderer.invoke('backup:import'),
  },
  dialog: {
    saveFile: (opts) => ipcRenderer.invoke('dialog:saveFile', opts),
    openFile: (opts) => ipcRenderer.invoke('dialog:openFile', opts),
  },
  categories: {
    list:   ()         => ipcRenderer.invoke('categories:list'),
    save:   (category) => ipcRenderer.invoke('categories:save', category),
    delete: (id)       => ipcRenderer.invoke('categories:delete', id),
  },
  images: {
    save: (data) => ipcRenderer.invoke('images:save', data),
  },
  stockMovements: {
    record: (data)      => ipcRenderer.invoke('stock_movements:record', data),
    list:   (productId) => ipcRenderer.invoke('stock_movements:list', productId),
  },
})
