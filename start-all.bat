@echo off
setlocal
set "ROOT=%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ===================================================
echo Starting University Management System on Localhost
echo ===================================================

:: 1. Start Spring Boot Core Backend (Port 8080)
echo [1/8] Starting Spring Boot Core Backend (Port 8080)...
start "University-Core (Port 8080)" /D "%ROOT%university-service" cmd /k "set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%%PATH%%&& mvnw.cmd spring-boot:run"

:: 2. Start Spring Boot LMS Service (Port 8082)
echo [2/8] Starting Spring Boot LMS Service (Port 8082)...
start "LMS-Service (Port 8082)" /D "%ROOT%university-lms-service" cmd /k "set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%%PATH%%&& mvnw.cmd spring-boot:run"

:: 3. Start Spring Boot Exam Service (Port 8083)
echo [3/8] Starting Spring Boot Exam Service (Port 8083)...
start "Exam-Service (Port 8083)" /D "%ROOT%university-exam-service" cmd /k "set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%%PATH%%&& mvnw.cmd spring-boot:run"

:: 4. Start ASP.NET Core Fee Service (Port 5100)
echo [4/8] Starting ASP.NET Core Fee Service (Port 5100)...
start "Fee-Service (Port 5100)" /D "%ROOT%university-fee-service" cmd /k "dotnet run"

:: 5. Start Node.js Notification Service (Port 5200)
echo [5/8] Starting Node.js Notification Service (Port 5200)...
start "Notification-Service (Port 5200)" /D "%ROOT%university-notification-service" cmd /k "node server.js"

:: 6. Start FastAPI AI Microservice (Port 8000)
echo [6/8] Starting FastAPI AI Microservice (Port 8000)...
start "AI-Microservice (Port 8000)" /D "%ROOT%university-ai-service" cmd /k "call .\venv\Scripts\activate.bat && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

:: 7. Start Node.js API Gateway (Port 5000)
echo [7/8] Starting Node.js API Gateway (Port 5000)...
start "API-Gateway (Port 5000)" /D "%ROOT%university-api-gateway" cmd /k "node server.js"

:: 8. Start React Frontend (Port 3000)
echo [8/8] Starting React Frontend (Port 3000)...
start "React-Frontend (Port 3000)" /D "%ROOT%university-frontend\university-frontend" cmd /k "npm start"

echo.
echo ===================================================
echo All services have been launched in separate console windows!
echo - React Frontend:       http://localhost:3000
echo - API Gateway:          http://localhost:5000
echo - Core Backend API:     http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui/index.html)
echo - LMS Service:          http://localhost:8082
echo - Exam Service:         http://localhost:8083
echo - Fee Service:          http://localhost:5100
echo - Notification Service: http://localhost:5200
echo - AI Microservice:      http://localhost:8000 (Health: http://localhost:8000/health)
echo - MySQL Database:       localhost:3306 (university_db)
echo ===================================================
echo.
pause
