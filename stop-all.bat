@echo off
echo ===================================================
echo Stopping University Management System Services
echo ===================================================

echo Stopping services on ports 8080, 8082, 8083, 8000, 5000, 5100, 5200, 3000...

for %%P in (8080 8082 8083 8000 5000 5100 5200 3000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%P" ^| findstr "LISTENING"') do (
        echo Killing process %%a on port %%P...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Done! All services stopped.
pause
