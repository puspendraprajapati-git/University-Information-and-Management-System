@echo off
title University Management Portal - Master Launcher
color 0B

echo ==============================================================================
echo              UNIVERSITY MANAGEMENT SYSTEM - ONE-CLICK LAUNCHER               
echo ==============================================================================
echo.
echo Launching all 10 university microservices, AI assistant and frontend...
echo.

set "SCRIPT_DIR=%~dp0scripts"

echo [1/10] Starting Core Service (Port 8080)...
start "Univ - [1/10] Core Service (8080)" "%SCRIPT_DIR%\run_core.bat"

echo [2/10] Starting LMS Service (Port 8082)...
start "Univ - [2/10] LMS Service (8082)" "%SCRIPT_DIR%\run_lms.bat"

echo [3/10] Starting Exam and Timetable Service (Port 8083)...
start "Univ - [3/10] Exam Service (8083)" "%SCRIPT_DIR%\run_exam.bat"

echo [4/10] Starting Placement and Career Service (Port 8084)...
start "Univ - [4/10] Placement Service (8084)" "%SCRIPT_DIR%\run_placement.bat"

echo [5/10] Starting Fee and Scholarship Service (Port 5100)...
start "Univ - [5/10] Fee Service (5100)" "%SCRIPT_DIR%\run_fee.bat"

echo [6/10] Starting Library Management Service (Port 5300)...
start "Univ - [6/10] Library Service (5300)" "%SCRIPT_DIR%\run_library.bat"

echo [7/10] Starting Notification Service (Port 5200)...
start "Univ - [7/10] Notification Service (5200)" "%SCRIPT_DIR%\run_notification.bat"

echo [8/10] Starting Medha AI Student Assistant (Port 8000)...
start "Univ - [8/10] Medha AI (8000)" "%SCRIPT_DIR%\run_ai.bat"

echo [9/10] Starting API Gateway (Port 5000)...
start "Univ - [9/10] API Gateway (5000)" "%SCRIPT_DIR%\run_gateway.bat"

echo [10/10] Starting React Frontend (Port 3000)...
start "Univ - [10/10] React Frontend (3000)" "%SCRIPT_DIR%\run_frontend.bat"

echo.
echo ==============================================================================
echo  ALL 10 SERVICES ARE LAUNCHING IN DEDICATED WINDOWS!
echo ==============================================================================
echo.
echo Waiting 8 seconds before opening the web portal...
ping 127.0.0.1 -n 9 >nul

start http://localhost:3000

echo.
echo Web Portal  : http://localhost:3000
echo API Gateway : http://localhost:5000
echo Medha AI    : http://localhost:8000/docs
echo.
echo Note: To cleanly shut down all services at any time, run: STOP_PROJECT.bat
echo.
pause
