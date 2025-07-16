$inputFiles = @("C:\Users\prestopa\OneDrive - Microsoft\repos\data\lza\tfm\ado\accelerator\config\inputs.yaml","C:\Users\prestopa\OneDrive - Microsoft\repos\data\lza\tfm\ado\accelerator\config\platform-landing-zone.tfvars")
$outputFolder = "C:\Users\prestopa\OneDrive - Microsoft\repos\data\lza\tfm\ado\accelerator\output"

# 🆕 NEW: Logging for deployment process
$logFile = Join-Path -Path $outputFolder -ChildPath "deployment.log"
Start-Transcript -Path $logFile

# 🆕 NEW: Notify user of deployment start
Write-Host "Starting deployment process..." -ForegroundColor Cyan

# 🆕 NEW: Log deployment start time
$startTime = Get-Date
Write-Host "Deployment started at: $startTime" -ForegroundColor Green

Deploy-Accelerator -inputs $inputFiles -output $outputFolder -destroy -Verbose

# 🆕 NEW: Log deployment end time
$endTime = Get-Date
Write-Host "Deployment ended at: $endTime" -ForegroundColor Green

# 🆕 NEW: Calculate and log deployment duration
$duration = $endTime - $startTime
Write-Host "Total deployment duration: $duration" -ForegroundColor Yellow

Stop-Transcript