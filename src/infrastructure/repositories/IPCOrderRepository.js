import { Order } from '@domain/entities'

export class IPCOrderRepository {
  async findAll() {
    const plains = await window.api.orders.list()
    return plains.map(o => new Order(o))
  }

  async findById(id) {
    const plain = await window.api.orders.findById(id)
    return plain ? new Order(plain) : null
  }

  async save(order) {
    const plain = order.toPlain ? order.toPlain() : order
    return window.api.orders.save(plain)
  }

  async update(order) {
    const plain = order.toPlain ? order.toPlain() : order
    return window.api.orders.update(plain)
  }

  async delete(id) {
    return window.api.orders.delete(id)
  }

  async finalize(id, payment) {
    return window.api.orders.finalize(id, payment)
  }
}
