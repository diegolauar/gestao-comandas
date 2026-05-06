export class IPCCategoryRepository {
  async findAll() {
    return window.api.categories.list()
  }

  async save(category) {
    return window.api.categories.save(category)
  }

  async delete(id) {
    return window.api.categories.delete(id)
  }
}
