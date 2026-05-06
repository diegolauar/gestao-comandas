import { NotFoundError } from '@domain/errors'

export class DeleteOrderUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository   = orderRepository
    this.productRepository = productRepository
  }

  async execute(id) {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new NotFoundError('Pedido', id)

    // Devolver estoque de todos os itens
    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId)
      if (product) {
        product.returnStock(item.qty)
        await this.productRepository.save(product)
      }
    }

    await this.orderRepository.delete(id)
  }
}
