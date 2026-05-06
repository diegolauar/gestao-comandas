import { DomainError } from './DomainError'

export class NotFoundError extends DomainError {
  constructor(entity, id) {
    super(`${entity} não encontrado: ${id}`)
    this.name = 'NotFoundError'
    this.entity = entity
    this.id = id
  }
}
