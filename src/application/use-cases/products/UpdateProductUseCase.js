import { Product } from '@domain/entities'
import { NotFoundError } from '@domain/errors'
import { toProductDTO } from '../../dtos'

export class UpdateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(input) {
    const existing = await this.productRepository.findById(input.id)
    if (!existing) throw new NotFoundError('Produto', input.id)

    const updated = new Product({
      id:       input.id,
      name:     input.name,
      category: input.category,
      price:    input.price,
      unit:     input.unit,
      stock:    input.stock,
      image:    input.image ?? existing.image,
    })

    await this.productRepository.save(updated)
    return toProductDTO(updated)
  }
}
