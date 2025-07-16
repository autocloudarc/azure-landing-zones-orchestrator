# Azure Landing Zone Terraform Accelerator - Environment Setup
# Set environment variables for PAT creation

# Instructions:
# 1. Update the values below with your specific information
# 2. Run: . .\Set-Environment.ps1  (note the dot and space at the beginning)
# 3. Then run: .\Create-Token1-Automated.ps1

Write-Host "Setting up environment for Azure Landing Zone Terraform Accelerator..." -ForegroundColor Green

# REQUIRED: Your Azure DevOps organization name (e.g., 'myorg' from https://dev.azure.com/myorg)
$env:ADO_ORG_NAME = "YOUR_ORG_NAME_HERE"

# REQUIRED: An existing PAT with 'vso.tokens_manage' scope to create new PATs
# You can create this manually in Azure DevOps with minimal scopes
$env:ADO_EXISTING_PAT = "YOUR_EXISTING_PAT_HERE"

# OPTIONAL: Number of days until the new PAT expires (default: 1 day)
$env:ADO_TOKEN_EXPIRY_DAYS = "1"

Write-Host "Environment variables set:" -ForegroundColor Cyan
Write-Host "  ADO_ORG_NAME: $env:ADO_ORG_NAME" -ForegroundColor White
Write-Host "  ADO_EXISTING_PAT: $('*' * $env:ADO_EXISTING_PAT.Length)" -ForegroundColor White
Write-Host "  ADO_TOKEN_EXPIRY_DAYS: $env:ADO_TOKEN_EXPIRY_DAYS" -ForegroundColor White

if ($env:ADO_ORG_NAME -eq "YOUR_ORG_NAME_HERE" -or $env:ADO_EXISTING_PAT -eq "YOUR_EXISTING_PAT_HERE") {
    Write-Host "`n⚠️  WARNING: Please update the placeholder values in this script before running!" -ForegroundColor Red
    Write-Host "   Edit Set-Environment.ps1 and replace YOUR_ORG_NAME_HERE and YOUR_EXISTING_PAT_HERE" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Environment is configured. You can now run: .\Create-Token1-Automated.ps1" -ForegroundColor Green
}
