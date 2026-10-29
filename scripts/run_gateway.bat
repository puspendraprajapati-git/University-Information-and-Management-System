@echo off
title Univ - [7/8] API Gateway (Port 5000)
color 09
cd /d "%~dp0..\university-api-gateway"
echo ======================================================
echo Starting [7/8] API Gateway on Port 5000...
echo ======================================================
node server.js
pause
