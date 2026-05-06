import { ValidationError } from '../errors'

export class OrderItem {
  constructor({ productId, name, qty, price }) {
    if (!productId)                                    throw new ValidationError('productId', 'obrigatório')
    if (!name?.trim())                                 throw new ValidationError('name', 'obrigatório')
    if (!qty || isNaN(Number(qty)) || Number(qty) < 1) throw new ValidationError('qty', 'deve ser no mínimo 1')
    if (price == null || isNaN(Number(price)))         throw new ValidationError('price', 'inválido')

    this.productId = productId
    this.name      = name.trim()
    this.qty       = Number(qty)
    this.price     = Number(price)
  }

  get subtotal() {
    // qty é inteiro; trabalha em centavos para evitar erro de ponto flutuante
    return (this.qty * Math.round(this.price * 100)) / 100
  }

  toPlain() {
    return { productId: this.productId, name: this.name, qty: this.qty, price: this.price }
  }
}
