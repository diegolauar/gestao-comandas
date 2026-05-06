import { Product } from '@domain/entities'
import { toProductDTO } from '../../dtos'

export class CreateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(input) {
    const product = new Product({
      id:       input.id || crypto.randomUUID(),
      name:     input.name,
      category: input.category,
      price:    input.price,
      unit:     input.unit,
      stock:    input.stock ?? 0,
      image:    input.image ?? '',
    })

    await this.productRepository.save(product)
    return toProductDTO(product)
  }
}
