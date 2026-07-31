param([ValidateSet("web","apk","exe","all")][string]$Target="web")
$ErrorActionPreference = "Stop"
Write-Host "chatez build:$Target" -ForegroundColor Cyan
switch ($Target) {
  "web" { npm run build:web }
  "apk" { npm run build:android }
  "exe" { npm run build:win }
  "all" { npm run build:all }
}
if ($LASTEXITCODE -eq 0) { Write-Host "chatez build:$Target OK" -ForegroundColor Green }
