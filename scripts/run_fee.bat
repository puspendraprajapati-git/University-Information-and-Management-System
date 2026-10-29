@echo off
title Univ - [5/8] Fee and Payment Service (Port 5100)
color 0D
cd /d "%~dp0..\university-fee-service"
echo ======================================================
echo Starting [5/8] Fee and Payment Service on Port 5100...
echo ======================================================
dotnet run
pause
