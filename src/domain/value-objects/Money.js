import { ValidationError } from '../errors'

export class Money {
  constructor(amount) {
    const value = Number(amount)
    if (isNaN(value) || value < 0) throw new ValidationError('price', 'deve ser um número positivo')
    this._value = Math.round(value * 100) / 100
  }

  get value() { return this._value }

  add(other) {
    return new Money((Math.round(this._value * 100) + Math.round(other._value * 100)) / 100)
  }
  multiply(qty) {
    return new Money(Math.round(this._value * 100 * qty) / 100)
  }

  format() {
    return this._value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  static fmt(amount) {
    return Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
}
