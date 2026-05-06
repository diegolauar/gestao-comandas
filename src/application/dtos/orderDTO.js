export const toOrderDTO = (order) => ({
  id:      order.id,
  client:  order.client,
  status:  order.status?.value ?? order.status,
  payment: order.payment,
  items:   order.items.map(i => ({
    productId: i.productId,
    name:      i.name,
    qty:       i.qty,
    price:     i.price,
    subtotal:  i.subtotal ?? (i.qty * Math.round(i.price * 100)) / 100,
  })),
  total:   order.total,
  obs:     order.obs,
  date:    order.date,
})
