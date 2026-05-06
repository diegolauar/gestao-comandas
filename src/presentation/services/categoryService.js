import { IPCCategoryRepository } from '@infra/repositories/IPCCategoryRepository'

const repo = new IPCCategoryRepository()

export const categoryService = {
  list:   ()         => repo.findAll(),
  save:   (category) => repo.save(category),
  delete: (id)       => repo.delete(id),
}
