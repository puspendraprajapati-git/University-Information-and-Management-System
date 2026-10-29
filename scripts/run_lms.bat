@echo off
title Univ - [2/8] LMS Service (Port 8082)
color 0E
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0..\university-lms-service"
echo ======================================================
echo Starting [2/8] LMS Service on Port 8082...
echo ======================================================
call .\mvnw.cmd spring-boot:run
pause
