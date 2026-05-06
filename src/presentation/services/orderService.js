import { IPCProductRepository } from '@infra/repositories/IPCProductRepository'
import { IPCOrderRepository }   from '@infra/repositories/IPCOrderRepository'
import {
  ListOrdersUseCase,
  CreateOrderUseCase,
  UpdateOrderUseCase,
  UpdateOrderStatusUseCase,
  FinalizeOrderUseCase,
  DeleteOrderUseCase,
} from '@application/use-cases/orders'

const orderRepo   = new IPCOrderRepository()
const productRepo = new IPCProductRepository()

export const orderUseCases = {
  list:         new ListOrdersUseCase(orderRepo),
  create:       new CreateOrderUseCase(orderRepo, productRepo),
  update:       new UpdateOrderUseCase(orderRepo, productRepo),
  updateStatus: new UpdateOrderStatusUseCase(orderRepo),
  finalize:     new FinalizeOrderUseCase(orderRepo),
  delete:       new DeleteOrderUseCase(orderRepo, productRepo),
}
