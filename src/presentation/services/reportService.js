import { IPCProductRepository } from '@infra/repositories/IPCProductRepository'
import { IPCOrderRepository }   from '@infra/repositories/IPCOrderRepository'
import { GetDashboardStatsUseCase, GetSalesReportUseCase } from '@application/use-cases/reports'

const orderRepo   = new IPCOrderRepository()
const productRepo = new IPCProductRepository()

export const reportUseCases = {
  dashboard: new GetDashboardStatsUseCase(orderRepo, productRepo),
  sales:     new GetSalesReportUseCase(orderRepo),
}
