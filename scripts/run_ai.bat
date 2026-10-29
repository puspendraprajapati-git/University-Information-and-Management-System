@echo off
title Univ - [10/10] Medha AI Student Assistant (Port 8000)
color 0A
cd /d "%~dp0..\university-ai-service"
echo ======================================================
echo Starting [10/10] Medha AI Student Assistant on Port 8000...
echo ======================================================
".\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
