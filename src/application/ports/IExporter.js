export class IExporter {
  // data: { orders, products, meta }
  // filePath: string
  async export(data, filePath) { throw new Error('IExporter.export() não implementado') }
}
