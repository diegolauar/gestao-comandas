import { DomainError } from './DomainError'

export class ValidationError extends DomainError {
  constructor(field, reason) {
    super(`Campo inválido: ${field} — ${reason}`)
    this.name = 'ValidationError'
    this.field = field
  }
}
