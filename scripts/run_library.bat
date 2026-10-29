@echo off
title Univ - [9/9] Library Service (Port 5300)
color 0B
cd /d "%~dp0..\university-library-service"
echo ======================================================
echo Starting [9/9] Library Service on Port 5300...
echo ======================================================
dotnet run
pause
