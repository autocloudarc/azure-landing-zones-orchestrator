@echo off
echo 🚀 Starting Azure Subscription Vending System...
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo ==================================================

REM Start API server in new window
echo Starting API Server...
start "API Server" cmd /k "cd api && npm run dev"

REM Wait a moment for API to start
timeout /t 2 /nobreak >nul

REM Start frontend server in new window  
echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows...
echo You can close this window once both servers are running.
pause
