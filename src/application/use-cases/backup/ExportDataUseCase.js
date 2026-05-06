export class ExportDataUseCase {
  constructor(orderRepository, productRepository, exporter) {
    this.orderRepository   = orderRepository
    this.productRepository = productRepository
    this.exporter          = exporter
  }

  async execute({ type = 'all', filePath }) {
    const [allOrders, products] = await Promise.all([
      this.orderRepository.findAll(),
      this.productRepository.findAll(),
    ])

    const now = new Date()
    let orders = allOrders

    if (type === 'today') {
      const today = now.toDateString()
      orders = allOrders.filter(o => new Date(o.date).toDateString() === today)
    } else if (type === 'month') {
      orders = allOrders.filter(o => {
        const d = new Date(o.date)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
    }

    const data = {
      meta: {
        tipo: type === 'today' ? 'backup_diario' : type === 'month' ? 'backup_mensal' : 'backup_completo',
        loja: 'K2 Emporium',
        geradoEm: now.toISOString(),
        totalPedidos: orders.length,
        totalProdutos: products.length,
      },
      orders:   orders.map(o => o.toPlain ? o.toPlain() : o),
      products: products.map(p => p.toPlain ? p.toPlain() : p),
    }

    await this.exporter.export(data, filePath)
    return { success: true, filePath, totalOrders: orders.length }
  }
}
