import { NotFoundError } from '@domain/errors'
import { toOrderDTO } from '../../dtos'

export class UpdateOrderStatusUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(id, status) {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new NotFoundError('Pedido', id)
    order.changeStatus(status)
    await this.orderRepository.update(order)
    return toOrderDTO(order)
  }
}
