export class IProductRepository {
  async findAll()       { throw new Error('IProductRepository.findAll() não implementado') }
  async findById(id)    { throw new Error('IProductRepository.findById() não implementado') }
  async save(product)   { throw new Error('IProductRepository.save() não implementado') }
  async delete(id)      { throw new Error('IProductRepository.delete() não implementado') }
}
