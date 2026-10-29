# Stop all University Portal services
Write-Host "Stopping all University Portal services..." -ForegroundColor Cyan

$ports = @(3000, 5000, 5100, 5200, 5300, 8000, 8080, 8082, 8083, 8084)

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($p in $pids) {
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                Write-Host "  [STOPPED] Port $port (PID: $p)" -ForegroundColor Green
            }
        } else {
            Write-Host "  [CLEAR]   Port $port is not running" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [WARN]    Could not inspect port $port" -ForegroundColor Yellow
    }
}

Write-Host "`nAll service ports have been cleared." -ForegroundColor Green
