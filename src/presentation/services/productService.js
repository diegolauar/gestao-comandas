import { IPCProductRepository } from '@infra/repositories/IPCProductRepository'
import {
  ListProductsUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from '@application/use-cases/products'

const repo = new IPCProductRepository()

export const productUseCases = {
  list:   new ListProductsUseCase(repo),
  create: new CreateProductUseCase(repo),
  update: new UpdateProductUseCase(repo),
  delete: new DeleteProductUseCase(repo),
}
