const ExcelJS = require('exceljs')

class ExcelExporter {
  async export(data, filePath) {
    const wb = new ExcelJS.Workbook()
    wb.creator = 'K2 Emporium'
    wb.created = new Date()

    this._buildOrdersSheet(wb, data.orders ?? [])
    this._buildProductsSheet(wb, data.products ?? [])
    this._buildCategoriesSheet(wb, data.categories ?? [])
    this._buildSummarySheet(wb, data)

    await wb.xlsx.writeFile(filePath)
  }

  _buildOrdersSheet(wb, orders) {
    const ws = wb.addWorksheet('Pedidos')
    ws.columns = [
      { header: 'Data',       key: 'date',    width: 18 },
      { header: 'Cliente',    key: 'client',  width: 22 },
      { header: 'Status',     key: 'status',  width: 12 },
      { header: 'Pagamento',  key: 'payment', width: 18 },
      { header: 'Total (R$)', key: 'total',   width: 14 },
      { header: 'Obs',        key: 'obs',     width: 30 },
    ]

    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4AF37' } }

    for (const order of orders) {
      ws.addRow({
        date:    new Date(order.date).toLocaleString('pt-BR'),
        client:  order.client,
        status:  order.status,
        payment: order.payment,
        total:   order.total,
        obs:     order.obs,
      })

      // Itens como sub-linhas
      for (const item of order.items ?? []) {
        const row = ws.addRow({
          date:   `  ↳ ${item.name}`,
          client: `${item.qty}x`,
          status: `R$ ${item.price.toFixed(2)}`,
          payment:`R$ ${(item.qty * Math.round(item.price * 100) / 100).toFixed(2)}`,
        })
        row.font = { color: { argb: 'FF888888' }, italic: true }
      }
    }
  }

  _buildProductsSheet(wb, products) {
    const ws = wb.addWorksheet('Produtos')
    ws.columns = [
      { header: 'Nome',       key: 'name',     width: 28 },
      { header: 'Categoria',  key: 'category', width: 16 },
      { header: 'Preço (R$)', key: 'price',    width: 14 },
      { header: 'Unidade',    key: 'unit',     width: 12 },
      { header: 'Estoque',    key: 'stock',    width: 10 },
    ]
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4AF37' } }
    for (const p of products) {
      ws.addRow({ name: p.name, category: p.category, price: p.price, unit: p.unit, stock: p.stock })
    }
  }

  _buildCategoriesSheet(wb, categories) {
    const ws = wb.addWorksheet('Categorias')
    ws.columns = [
      { header: 'ID',   key: 'id',   width: 38 },
      { header: 'Nome', key: 'name', width: 28 },
    ]
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4AF37' } }
    for (const cat of categories) {
      ws.addRow({ id: cat.id, name: cat.name })
    }
  }

  _buildSummarySheet(wb, data) {
    const ws   = wb.addWorksheet('Resumo')
    const meta = data.meta ?? {}
    const rows = [
      ['Loja',            'K2 Emporium'],
      ['Gerado em',       new Date().toLocaleString('pt-BR')],
      ['Tipo de backup',  meta.tipo ?? ''],
      ['Total de pedidos',data.orders?.length ?? 0],
      ['Total de produtos',data.products?.length ?? 0],
      ['Valor total',     `R$ ${(data.orders ?? []).reduce((s, o) => s + o.total, 0).toFixed(2)}`],
    ]
    for (const [label, value] of rows) {
      const row = ws.addRow([label, value])
      row.getCell(1).font = { bold: true }
    }
    ws.getColumn(1).width = 22
    ws.getColumn(2).width = 28
  }
}

module.exports = { ExcelExporter }
