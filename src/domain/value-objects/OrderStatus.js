import { ValidationError } from '../errors'

const VALID = ['aberto', 'entregue', 'cancelado']

export class OrderStatus {
  constructor(value) {
    if (!VALID.includes(value)) {
      throw new ValidationError('status', `deve ser um de: ${VALID.join(', ')}`)
    }
    this._value = value
  }

  get value() { return this._value }

  isOpen()      { return this._value === 'aberto' }
  isDelivered() { return this._value === 'entregue' }
  isCancelled() { return this._value === 'cancelado' }

  static get ALL() { return VALID }
  static get ABERTO()    { return new OrderStatus('aberto') }
  static get ENTREGUE()  { return new OrderStatus('entregue') }
  static get CANCELADO() { return new OrderStatus('cancelado') }
}
