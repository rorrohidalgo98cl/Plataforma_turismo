$url = "https://get.enterprisedb.com/postgresql/postgresql-16.8-1-windows-x64-binaries.zip"
$out = "C:\Users\rodri\Downloads\pgsql16.zip"

Write-Host "Descargando PostgreSQL 16 binaries (~300MB)..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    $size = (Get-Item $out).Length / 1MB
    Write-Host "Descarga completa: $([math]::Round($size, 1)) MB" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
