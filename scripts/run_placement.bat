@echo off
title Univ - [4/8] Placement and Career Service (Port 8084)
color 0A
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0..\university-placement-service"
echo ==============================================================
echo Starting [4/8] Placement and Career Management Service on 8084...
echo ==============================================================
call .\mvnw.cmd spring-boot:run
pause
