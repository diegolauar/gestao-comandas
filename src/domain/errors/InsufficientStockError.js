import { DomainError } from './DomainError'

export class InsufficientStockError extends DomainError {
  constructor(productName, available, requested) {
    super(`Estoque insuficiente para "${productName}": disponível ${available}, solicitado ${requested}`)
    this.name = 'InsufficientStockError'
    this.productName = productName
    this.available = available
    this.requested = requested
  }
}
