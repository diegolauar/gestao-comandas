const Jimp = require('jimp')
const { default: pngToIco } = require('png-to-ico')
const fs   = require('fs')
const path = require('path')

async function main() {
  const src  = path.join(__dirname, '..', 'assets', 'logo.png')
  const tmp  = path.join(__dirname, '..', 'assets', 'logo-square.png')
  const dest = path.join(__dirname, '..', 'assets', 'icon.ico')

  const img = await Jimp.read(src)
  const size = 256
  const square = new Jimp(size, size, 0x00000000) // fundo transparente
  const resized = img.scaleToFit(size, size)
  const x = Math.floor((size - resized.bitmap.width)  / 2)
  const y = Math.floor((size - resized.bitmap.height) / 2)
  square.composite(resized, x, y)
  await square.writeAsync(tmp)

  const buf = await pngToIco(tmp)
  fs.writeFileSync(dest, buf)
  fs.unlinkSync(tmp)
  console.log(`icon.ico gerado: ${buf.length} bytes`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
