import { Order } from '@domain/entities'
import { NotFoundError, InsufficientStockError } from '@domain/errors'
import { toOrderDTO } from '../../dtos'

export class CreateOrderUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository   = orderRepository
    this.productRepository = productRepository
  }

  async execute(input) {
    const ids      = [...new Set(input.items.map(i => i.productId))]
    const fetched  = await this.productRepository.findByIds(ids)
    const byId     = Object.fromEntries(fetched.map(p => [p.id, p]))

    for (const item of input.items) {
      const product = byId[item.productId]
      if (!product) throw new NotFoundError('Produto', item.productId)
      if (product.stock < item.qty) {
        throw new InsufficientStockError(product.name, product.stock, item.qty)
      }
    }

    for (const item of input.items) {
      byId[item.productId].deductStock(item.qty)
      await this.productRepository.save(byId[item.productId])
    }

    const order = new Order({
      id:      crypto.randomUUID(),
      client:  input.client,
      status:  'aberto',
      payment: '',
      items:   input.items,
      obs:     input.obs,
      date:    new Date().toISOString(),
    })

    await this.orderRepository.save(order)
    return toOrderDTO(order)
  }
}
