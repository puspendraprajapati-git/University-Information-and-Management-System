@echo off
title Univ - [6/8] Notification Service (Port 5200)
color 03
cd /d "%~dp0..\university-notification-service"
echo ======================================================
echo Starting [6/8] Notification Service on Port 5200...
echo ======================================================
node server.js
pause
