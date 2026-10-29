Write-Host "===================================================" -ForegroundColor Yellow
Write-Host "Stopping University Management System Services" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

$ports = @(8080, 8082, 8083, 8000, 5000, 5100, 5200, 3000)

foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($conn in $conns) {
                Write-Host "Stopping process PID $($conn.OwningProcess) on port $port..." -ForegroundColor Cyan
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
}

Write-Host "Done! All services stopped." -ForegroundColor Green
