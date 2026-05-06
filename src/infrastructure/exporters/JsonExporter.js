const fs = require('fs')

class JsonExporter {
  async export(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }
}

module.exports = { JsonExporter }
