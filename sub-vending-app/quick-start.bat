@echo off
echo 🚀 Quick Start - Azure Subscription Vending System
echo.
echo Starting servers in fast mode...
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001
echo.

REM Start API server in quick mode
echo Starting Quick API Server...
start "Quick API" cmd /k "cd api && node quick-start.js"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start frontend
echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers starting in separate windows
echo ✅ No database connection delays
echo ✅ Ready to test in ~10 seconds
pause
