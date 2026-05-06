import { ValidationError } from '../errors'

export class Product {
  constructor({ id, name, category, price, unit, stock, image = '' }) {
    if (!id)             throw new ValidationError('id', 'obrigatório')
    if (!name?.trim())   throw new ValidationError('name', 'obrigatório')
    if (!category)       throw new ValidationError('category', 'obrigatório')
    if (price == null || isNaN(Number(price)) || Number(price) < 0)
                         throw new ValidationError('price', 'deve ser um número positivo')
    if (!unit)           throw new ValidationError('unit', 'obrigatório')

    this.id       = id
    this.name     = name.trim()
    this.category = category
    this.price    = Number(price)
    this.unit     = unit
    this.stock    = Number(stock) || 0
    this.image    = image
  }

  hasLowStock(threshold = 5) {
    return this.stock <= threshold
  }

  deductStock(qty) {
    if (qty > this.stock) return false
    this.stock -= qty
    return true
  }

  returnStock(qty) {
    this.stock += qty
  }

  toPlain() {
    return {
      id: this.id, name: this.name, category: this.category,
      price: this.price, unit: this.unit, stock: this.stock, image: this.image,
    }
  }

  static CATEGORIES = ['Cerveja', 'Refrigerante', 'Água', 'Vinho', 'Destilado', 'Carne', 'Frios', 'Outro']
  static UNITS      = ['Garrafa', 'Lata', 'Caixa', 'Fardo', 'Barril', 'Kg', 'Unidade']
}
