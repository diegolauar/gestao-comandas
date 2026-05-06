import { Product } from '@domain/entities'

export class IPCProductRepository {
  async findAll() {
    const plains = await window.api.products.list()
    return plains.map(p => new Product(p))
  }

  async findById(id) {
    const plain = await window.api.products.findById(id)
    return plain ? new Product(plain) : null
  }

  async findByIds(ids) {
    const plains = await window.api.products.findByIds(ids)
    return plains.map(p => new Product(p))
  }

  async save(product) {
    const plain = product.toPlain ? product.toPlain() : product
    return window.api.products.save(plain)
  }

  async delete(id) {
    return window.api.products.delete(id)
  }
}
