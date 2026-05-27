# Script de arranque total — Plataforma Turismo MVP
# =================================================

Write-Host "🚀 Iniciando Plataforma Turismo..." -ForegroundColor Cyan

# 1. Iniciar PostgreSQL
Write-Host "🐘 Iniciando PostgreSQL..." -ForegroundColor Yellow
$PG_DIR = "C:\pgsql"
if (Test-Path "$PG_DIR\bin\pg_ctl.exe") {
    Start-Process -FilePath "$PG_DIR\bin\pg_ctl.exe" -ArgumentList "start -D $PG_DIR\data" -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "❌ Error: No se encontró PostgreSQL en $PG_DIR" -ForegroundColor Red
}

# 2. Iniciar Servidor Python (Scraper/API)
Write-Host "🐍 Iniciando Servidor Python (FastAPI)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd scraper; python server.py" -WindowStyle Normal

# 3. Iniciar Frontend Next.js
Write-Host "🌐 Iniciando Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ ¡Todo listo!" -ForegroundColor Green
Write-Host "• Frontend: http://localhost:3000"
Write-Host "• API Python: http://localhost:8001"
Write-Host "• Docs API: http://localhost:8001/docs"
