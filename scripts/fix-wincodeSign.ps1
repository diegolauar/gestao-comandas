# Pre-popula o cache do winCodeSign para o electron-builder não tentar extrair
$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0"
$7za      = "$PSScriptRoot\..\node_modules\7zip-bin\win\x64\7za.exe"
$tmpFile  = "$env:TEMP\winCodeSign-2.6.0.7z"
$url      = "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"

if (Test-Path $cacheDir) {
  Write-Host "Cache já existe, pulando." -ForegroundColor Green
  exit 0
}

Write-Host "Baixando winCodeSign..." -ForegroundColor Cyan
Invoke-WebRequest $url -OutFile $tmpFile

Write-Host "Extraindo (ignorando erros de symlink do macOS)..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
& $7za x $tmpFile "-o$cacheDir" -y | Out-Null

# Cria arquivos vazios no lugar dos symlinks do macOS que o 7-Zip não consegue criar
$libDir = "$cacheDir\darwin\10.12\lib"
New-Item -ItemType Directory -Force -Path $libDir | Out-Null
foreach ($f in @("libcrypto.dylib","libssl.dylib","libcrypto.1.1.dylib","libssl.1.1.dylib")) {
  if (-not (Test-Path "$libDir\$f")) {
    New-Item -ItemType File -Force -Path "$libDir\$f" | Out-Null
  }
}

Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
Write-Host "Cache populado em: $cacheDir" -ForegroundColor Green
Write-Host "Agora rode: npm run dist" -ForegroundColor Yellow
