import { NotFoundError, InsufficientStockError } from '@domain/errors'
import { toOrderDTO } from '../../dtos'

export class UpdateOrderUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository   = orderRepository
    this.productRepository = productRepository
  }

  async execute(input) {
    const existing = await this.orderRepository.findById(input.id)
    if (!existing) throw new NotFoundError('Pedido', input.id)

    // 1. Batch fetch produtos antigos e devolver estoque
    const oldIds     = [...new Set(existing.items.map(i => i.productId))]
    const oldFetched = await this.productRepository.findByIds(oldIds)
    const oldById    = Object.fromEntries(oldFetched.map(p => [p.id, p]))

    for (const oldItem of existing.items) {
      const product = oldById[oldItem.productId]
      if (product) {
        product.returnStock(oldItem.qty)
        await this.productRepository.save(product)
      }
    }

    // 2. Batch fetch produtos novos, validar e baixar estoque
    const newIds     = [...new Set(input.items.map(i => i.productId))]
    const newFetched = await this.productRepository.findByIds(newIds)
    const newById    = Object.fromEntries(newFetched.map(p => [p.id, p]))

    for (const item of input.items) {
      const product = newById[item.productId]
      if (!product) throw new NotFoundError('Produto', item.productId)
      if (product.stock < item.qty) {
        throw new InsufficientStockError(product.name, product.stock, item.qty)
      }
    }

    for (const item of input.items) {
      newById[item.productId].deductStock(item.qty)
      await this.productRepository.save(newById[item.productId])
    }

    // 3. Atualizar o pedido
    existing.client  = input.client
    existing.payment = input.payment
    existing.obs     = input.obs
    existing.updateItems(input.items)

    await this.orderRepository.update(existing)
    return toOrderDTO(existing)
  }
}
