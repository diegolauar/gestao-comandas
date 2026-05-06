import { toOrderDTO } from '../../dtos'

export class ListOrdersUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute({ search = '', status = 'todos' } = {}) {
    const orders = await this.orderRepository.findAll()
    const term = search.toLowerCase()

    return orders
      .filter(o => status === 'todos' || o.status.value === status)
      .filter(o => !term || o.client.toLowerCase().includes(term))
      .map(toOrderDTO)
  }
}
