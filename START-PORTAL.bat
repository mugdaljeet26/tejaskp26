@echo off
title Tejaskp AI Portal
echo ================================================
echo  Starting Tejaskp AI Portal...
echo ================================================

:: Start Backend API Server (port 5000)
echo [1/2] Starting Backend API Server on port 5000...
start "Backend API Server" cmd /k "cd /d "%~dp0tejasspk-ai-software" && node server/server.js"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend Static Server (port 80)
echo [2/2] Starting Frontend Portal Server on port 80...
start "Frontend Portal" cmd /k "cd /d "%~dp0" && node start-portal.js"

echo ================================================
echo  Both servers are starting!
echo  - Admin Panel: http://127.0.0.1/admin.html
echo  - API Server:  http://localhost:5000
echo ================================================
pause
