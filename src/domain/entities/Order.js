import { ValidationError } from '../errors'
import { OrderStatus } from '../value-objects'
import { OrderItem } from './OrderItem'

export const PAYMENT_METHODS = ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito']

export class Order {
  constructor({ id, client, status = 'aberto', payment = '', items = [], obs = '', date }) {
    if (!id)            throw new ValidationError('id', 'obrigatório')
    if (!client?.trim())throw new ValidationError('client', 'obrigatório')

    this.id      = id
    this.client  = client.trim()
    this.status  = new OrderStatus(status)
    this.payment = payment || ''
    this.items   = items.map(i => i instanceof OrderItem ? i : new OrderItem(i))
    this.obs     = obs || ''
    this.date    = date || new Date().toISOString()

    if (this.items.length === 0) throw new ValidationError('items', 'o pedido deve ter ao menos um item')
  }

  get total() {
    // Soma em centavos para evitar acúmulo de erro de ponto flutuante
    return this.items.reduce((sum, i) => sum + Math.round(i.subtotal * 100), 0) / 100
  }

  changeStatus(newStatus) {
    this.status = new OrderStatus(newStatus)
  }

  // Fecha a comanda: registra pagamento e marca como entregue
  finalize(payment) {
    if (!payment?.trim()) throw new ValidationError('payment', 'forma de pagamento obrigatória ao finalizar')
    this.payment = payment.trim()
    this.status  = new OrderStatus('entregue')
  }

  updateItems(newItems) {
    const parsed = newItems.map(i => i instanceof OrderItem ? i : new OrderItem(i))
    if (parsed.length === 0) throw new ValidationError('items', 'o pedido deve ter ao menos um item')
    this.items = parsed
  }

  toPlain() {
    return {
      id:      this.id,
      client:  this.client,
      status:  this.status.value,
      payment: this.payment,
      items:   this.items.map(i => i.toPlain()),
      total:   this.total,
      obs:     this.obs,
      date:    this.date,
    }
  }
}
