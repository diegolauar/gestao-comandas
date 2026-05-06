export class GetDashboardStatsUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository   = orderRepository
    this.productRepository = productRepository
  }

  async execute() {
    const [orders, products] = await Promise.all([
      this.orderRepository.findAll(),
      this.productRepository.findAll(),
    ])

    const today = new Date().toDateString()
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === today)

    return {
      totalToday:     todayOrders.reduce((s, o) => s + o.total, 0),
      ordersToday:    todayOrders.length,
      openOrders:     orders.filter(o => o.status.value === 'aberto').length,
      deliveredTotal: orders.filter(o => o.status.value === 'entregue').reduce((s, o) => s + o.total, 0),
      totalProducts:  products.length,
      lowStockItems:  products.filter(p => p.stock <= 5),
      recentOrders:   todayOrders.slice(0, 5).map(o => ({
        id: o.id, client: o.client, total: o.total,
        status: o.status.value, items: o.items.length,
      })),
    }
  }
}
