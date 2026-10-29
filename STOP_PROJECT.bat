@echo off
title University Management Portal - Stopper
color 0C

echo ==============================================================================
echo              UNIVERSITY MANAGEMENT SYSTEM - ONE-CLICK STOPPER               
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop_all.ps1"

echo.
echo ==============================================================================
echo  ALL SERVICES HAVE BEEN SAFELY STOPPED!
echo ==============================================================================
echo.
pause
