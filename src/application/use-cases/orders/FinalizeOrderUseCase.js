import { NotFoundError } from '@domain/errors'
import { toOrderDTO } from '../../dtos'

// Fecha a comanda: registra a forma de pagamento e muda status para "entregue"
export class FinalizeOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(id, payment) {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new NotFoundError('Pedido', id)

    order.finalize(payment) // valida pagamento e muda status no domínio
    await this.orderRepository.update(order)
    return toOrderDTO(order)
  }
}
