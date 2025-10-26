@echo off
echo ========================================
echo Universal Project Manager - Startup
echo ========================================
echo.
echo Starting backend server and frontend...
echo.

REM Start backend server in a new window
start "Backend Server (Port 3001)" cmd /k "npm run server"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend dev server in a new window
start "Frontend Dev Server (Port 5173)" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo.
echo Backend Server: http://localhost:3001
echo Frontend App:   http://localhost:5173
echo.
echo Two windows will open:
echo   1. Backend Server (Port 3001)
echo   2. Frontend Dev Server (Port 5173)
echo.
echo Press Ctrl+C in each window to stop the servers.
echo.
pause
