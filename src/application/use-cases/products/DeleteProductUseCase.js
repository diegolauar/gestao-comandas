import { NotFoundError } from '@domain/errors'

export class DeleteProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(id) {
    const existing = await this.productRepository.findById(id)
    if (!existing) throw new NotFoundError('Produto', id)
    await this.productRepository.delete(id)
  }
}
