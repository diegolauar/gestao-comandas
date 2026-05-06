export class ImportDataUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository   = orderRepository
    this.productRepository = productRepository
  }

  async execute(data) {
    const existingOrders   = await this.orderRepository.findAll()
    const existingProducts = await this.productRepository.findAll()

    const existingOrderIds   = new Set(existingOrders.map(o => o.id))
    const existingProductIds = new Set(existingProducts.map(p => p.id))

    let importedOrders = 0, importedProducts = 0

    if (Array.isArray(data.orders)) {
      for (const order of data.orders) {
        if (!existingOrderIds.has(order.id)) {
          await this.orderRepository.save(order)
          importedOrders++
        }
      }
    }

    if (Array.isArray(data.products)) {
      for (const product of data.products) {
        if (!existingProductIds.has(product.id)) {
          await this.productRepository.save(product)
          importedProducts++
        }
      }
    }

    return { importedOrders, importedProducts }
  }
}
