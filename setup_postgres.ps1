$pgBin    = "C:\pgsql\bin"
$dataDir  = "C:\pgsql\data"
$logFile  = "C:\pgsql\pgsql.log"

Write-Host "`n[1/4] Inicializando cluster PostgreSQL..." -ForegroundColor Cyan
if (-not (Test-Path $dataDir)) {
    & "$pgBin\initdb.exe" -D $dataDir -U postgres --encoding=UTF8
    Write-Host "Cluster inicializado." -ForegroundColor Green
} else {
    Write-Host "Data dir ya existe, saltando initdb." -ForegroundColor Yellow
}

Write-Host "`n[2/4] Iniciando servidor..." -ForegroundColor Cyan
& "$pgBin\pg_ctl.exe" start -D $dataDir -l $logFile
Start-Sleep 4

Write-Host "`n[3/4] Creando base de datos turismo_mvp..." -ForegroundColor Cyan
& "$pgBin\createdb.exe" -U postgres turismo_mvp

Write-Host "`n[4/4] Verificando conexion..." -ForegroundColor Cyan
& "$pgBin\psql.exe" -U postgres -d turismo_mvp -c "SELECT version();"

Write-Host "`n=== PostgreSQL LISTO ===" -ForegroundColor Green
Write-Host "Host:    localhost:5432"
Write-Host "Usuario: postgres (sin password)"
Write-Host "DB:      turismo_mvp"
Write-Host "psql:    $pgBin\psql.exe -U postgres -d turismo_mvp"
