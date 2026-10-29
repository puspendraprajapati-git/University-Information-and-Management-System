@echo off
title Univ - [3/8] Exam and Timetable Service (Port 8083)
color 0B
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0..\university-exam-service"
echo ======================================================
echo Starting [3/8] Exam and Timetable Service on Port 8083...
echo ======================================================
call .\mvnw.cmd spring-boot:run
pause
