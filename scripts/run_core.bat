@echo off
title Univ - [1/8] Core University Service (Port 8080)
color 0A
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0..\university-service"
echo ======================================================
echo Starting [1/8] Core University Service on Port 8080...
echo ======================================================
call .\mvnw.cmd spring-boot:run
pause
