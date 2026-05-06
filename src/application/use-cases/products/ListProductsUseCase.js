import { toProductDTO } from '../../dtos'

export class ListProductsUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async execute(search = '') {
    const products = await this.productRepository.findAll()
    const term = search.toLowerCase()
    const filtered = term
      ? products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
        )
      : products
    return filtered.map(toProductDTO)
  }
}
