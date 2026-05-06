export class IOrderRepository {
  async findAll()        { throw new Error('IOrderRepository.findAll() não implementado') }
  async findById(id)     { throw new Error('IOrderRepository.findById() não implementado') }
  async save(order)      { throw new Error('IOrderRepository.save() não implementado') }
  async update(order)    { throw new Error('IOrderRepository.update() não implementado') }
  async delete(id)       { throw new Error('IOrderRepository.delete() não implementado') }
}
