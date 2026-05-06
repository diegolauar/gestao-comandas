export const toProductDTO = (product) => ({
  id:       product.id,
  name:     product.name,
  category: product.category,
  price:    product.price,
  unit:     product.unit,
  stock:    product.stock,
  image:    product.image,
})
