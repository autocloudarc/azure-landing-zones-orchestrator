# Start Both Frontend and Backend Servers
# This script starts both the React frontend and Express.js backend concurrently

Write-Host "🚀 Starting Azure Subscription Vending System..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host "=" * 50

# Get the current directory (should be the project root)
$projectRoot = Get-Location

# Start the API server in a new PowerShell process
Write-Host "Starting API Server..." -ForegroundColor Blue
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot
    Set-Location "api"
    npm run dev
} -Name "APIServer"

# Start the frontend development server in a new PowerShell process  
Write-Host "Starting Frontend Server..." -ForegroundColor Blue
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot
    npm run dev
} -Name "FrontendServer"

# Wait for user to press Ctrl+C
try {
    Write-Host "Both servers are starting up..." -ForegroundColor Green
    Write-Host "Waiting for servers to be ready..." -ForegroundColor Yellow
    
    # Keep the script running and show job output
    while ($true) {
        # Check if jobs are still running
        if ($apiJob.State -eq 'Failed' -or $frontendJob.State -eq 'Failed') {
            Write-Host "One of the servers failed to start!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
}
finally {
    # Clean up jobs
    Write-Host "Stopping API Server..." -ForegroundColor Red
    Stop-Job -Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job -Job $apiJob -ErrorAction SilentlyContinue
    
    Write-Host "Stopping Frontend Server..." -ForegroundColor Red  
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    
    Write-Host "All servers stopped." -ForegroundColor Green
} #end try
