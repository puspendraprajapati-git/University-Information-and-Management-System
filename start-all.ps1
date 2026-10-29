$root = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting University Management System on Localhost" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Spring Boot Core (8080)
Write-Host "[1/8] Starting Core Backend (Port 8080)..."
Start-Process cmd.exe -ArgumentList '/k "set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%PATH%&& mvnw.cmd spring-boot:run"' -WorkingDirectory "$root\university-service"

# 2. Spring Boot LMS (8082)
Write-Host "[2/8] Starting LMS Service (Port 8082)..."
Start-Process cmd.exe -ArgumentList '/k "set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%PATH%&& mvnw.cmd spring-boot:run"' -WorkingDirectory "$root\university-lms-service"

# 3. Spring Boot Exam (8083)
Write-Host "[3/8] Starting Exam Service (Port 8083)..."
Start-Process cmd.exe -ArgumentList '/k "set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%PATH%&& mvnw.cmd spring-boot:run"' -WorkingDirectory "$root\university-exam-service"

# 4. ASP.NET Core Fee Service (5100)
Write-Host "[4/8] Starting Fee Service (Port 5100)..."
Start-Process cmd.exe -ArgumentList '/k "dotnet run"' -WorkingDirectory "$root\university-fee-service"

# 5. Node.js Notification Service (5200)
Write-Host "[5/8] Starting Notification Service (Port 5200)..."
Start-Process cmd.exe -ArgumentList '/k "node server.js"' -WorkingDirectory "$root\university-notification-service"

# 6. Python FastAPI AI Service (8000)
Write-Host "[6/8] Starting AI Service (Port 8000)..."
Start-Process cmd.exe -ArgumentList '/k "call .\venv\Scripts\activate.bat && python -m uvicorn main:app --host 127.0.0.1 --port 8000"' -WorkingDirectory "$root\university-ai-service"

# 7. Node.js API Gateway (5000)
Write-Host "[7/8] Starting API Gateway (Port 5000)..."
Start-Process cmd.exe -ArgumentList '/k "node server.js"' -WorkingDirectory "$root\university-api-gateway"

# 8. React Frontend (3000)
Write-Host "[8/8] Starting React Frontend (Port 3000)..."
Start-Process cmd.exe -ArgumentList '/k "npm start"' -WorkingDirectory "$root\university-frontend\university-frontend"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "All 8 services launched in separate windows!" -ForegroundColor Green
Write-Host "- React Frontend:       http://localhost:3000"
Write-Host "- API Gateway:          http://localhost:5000"
Write-Host "- Core Backend API:     http://localhost:8080 (Swagger: /swagger-ui/index.html)"
Write-Host "- LMS Service:          http://localhost:8082"
Write-Host "- Exam Service:         http://localhost:8083"
Write-Host "- Fee Service:          http://localhost:5100"
Write-Host "- Notification Service: http://localhost:5200"
Write-Host "- AI Microservice:      http://localhost:8000 (Health: /health)"
Write-Host "===================================================" -ForegroundColor Green
