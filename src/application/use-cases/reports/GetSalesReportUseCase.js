const RANGE_DAYS = { week: 7, month: 30, all: 99999 }

export class GetSalesReportUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(range = 'week') {
    const orders = await this.orderRepository.findAll()
    const now = new Date()

    let filtered
    if (range === 'today') {
      const todayStr = now.toDateString()
      filtered = orders.filter(o =>
        new Date(o.date).toDateString() === todayStr && o.status.value !== 'cancelado'
      )
    } else {
      const days = RANGE_DAYS[range] ?? 7
      const since = new Date(now - days * 86400000)
      filtered = orders.filter(o =>
        new Date(o.date) >= since && o.status.value !== 'cancelado'
      )
    }

    const totalSales  = filtered.reduce((s, o) => s + o.total, 0)
    const totalOrders = filtered.length
    const avgTicket   = totalOrders ? totalSales / totalOrders : 0

    // Top produtos
    const prodMap = {}
    filtered.forEach(o => o.items.forEach(i => {
      if (!prodMap[i.name]) prodMap[i.name] = { name: i.name, qty: 0, total: 0 }
      prodMap[i.name].qty   += i.qty
      prodMap[i.name].total  = (Math.round(prodMap[i.name].total * 100) + i.qty * Math.round(i.price * 100)) / 100
    }))
    const topProducts = Object.values(prodMap).sort((a, b) => b.total - a.total).slice(0, 8)

    // Pagamentos
    const payMap = {}
    filtered.forEach(o => {
      if (!payMap[o.payment]) payMap[o.payment] = 0
      payMap[o.payment] += o.total
    })

    // Vendas dos últimos 7 dias (para o gráfico de barras)
    const dailyMap = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const key = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      dailyMap[key] = 0
    }
    filtered.forEach(o => {
      const key = new Date(o.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      if (key in dailyMap) dailyMap[key] += o.total
    })

    return {
      totalSales,
      totalOrders,
      avgTicket,
      topProducts,
      paymentBreakdown: Object.entries(payMap).map(([method, total]) => ({ method, total })),
      dailySales: Object.entries(dailyMap).map(([day, total]) => ({ day, total })),
    }
  }
}
