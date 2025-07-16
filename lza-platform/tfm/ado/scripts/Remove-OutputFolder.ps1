Write-Host "Removing output folder contents..."
# 🆕 NEW: Define the output folder path
$outputFolder = "C:\Users\prestopa\OneDrive - Microsoft\repos\data\lza\tfm\ado\accelerator\output"
# 🆕 NEW: Remove all contents of the output folder
Get-ChildItem -Path $outputFolder -Recurse | Remove-Item -Force -Verbose