#Requires -Version 5.1

<#
.SYNOPSIS
    Creates a Personal Access Token (PAT) in Azure DevOps with specified scopes for the Azure Landing Zone Terraform Accelerator.

.DESCRIPTION
    This script automates the creation of a Personal Access Token in Azure DevOps with the required scopes:
    - Agent Pools: Read & manage
    - Build: Read & execute
    - Code: Full
    - Environment: Read & manage
    - Graph: Read & manage
    - Pipeline Resources: Use & manage
    - Project and Team: Read, write & manage
    - Service Connections: Read, query & manage
    - Variable Groups: Read, create & manage

.PARAMETER OrganizationName
    The name of your Azure DevOps organization (e.g., 'myorg' from https://dev.azure.com/myorg)

.PARAMETER ExistingPAT
    An existing PAT with sufficient permissions to create new PATs (must have vso.tokens_manage scope)

.PARAMETER TokenName
    The name for the new PAT. Defaults to "alz-tfm-01"

.PARAMETER ExpirationDays
    Number of days from today when the token should expire. Defaults to 90 (in 90 days)

.EXAMPLE
    .\Create-ADO-PAT.ps1 -OrganizationName "myorg" -ExistingPAT "your-existing-pat-here"

.NOTES
    - Requires an existing PAT with vso.tokens_manage scope to create new PATs
    - The new PAT will be saved securely and displayed once
    - Store the generated PAT securely as it cannot be retrieved later
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$OrganizationName,
    
    [Parameter(Mandatory = $true)]
    [string]$ExistingPAT,
    
    [Parameter(Mandatory = $false)]
    [string]$TokenName = "alz-tfm-01",
    
    [Parameter(Mandatory = $false)]
    [int]$ExpirationDays = 90
)

# Set up error handling
$ErrorActionPreference = 'Stop'

# Function to create authorization header
function Get-AuthHeader {
    param([string]$Pat)
    $base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$Pat"))
    return @{
        'Authorization' = "Basic $base64AuthInfo"
        'Content-Type' = 'application/json'
        'Accept' = 'application/json'
    }
}

# Function to get tomorrow's date in ISO format
function Get-ExpirationDate {
    param([int]$DaysFromNow)
    return (Get-Date).AddDays($DaysFromNow).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

try {
    Write-Host "Creating Personal Access Token for Azure DevOps..." -ForegroundColor Green
    
    # Azure DevOps REST API endpoint
    $baseUrl = "https://vssps.dev.azure.com/$OrganizationName"
    $apiUrl = "$baseUrl/_apis/Tokens/Pats?api-version=7.1-preview.1"
    
    # Calculate expiration date
    $expirationDate = Get-ExpirationDate -DaysFromNow $ExpirationDays
    Write-Host "Token will expire on: $expirationDate" -ForegroundColor Yellow
    
    # Define the required scopes for Azure Landing Zone Terraform Accelerator
    $scopes = @(
        "vso.agent_management",          # Agent Pools: Read & manage
        "vso.build_execute",             # Build: Read & execute
        "vso.code_full",                 # Code: Full
        "vso.environment_manage",        # Environment: Read & manage
        "vso.graph_manage",              # Graph: Read & manage
        "vso.pipelineresources_manage",  # Pipeline Resources: Use & manage
        "vso.project_manage",            # Project and Team: Read, write & manage
        "vso.serviceendpoint_manage",    # Service Connections: Read, query & manage
        "vso.variablegroups_manage"      # Variable Groups: Read, create & manage
    )
    
    # Create the request body
    $requestBody = @{
        displayName = $TokenName
        scope = ($scopes -join " ")
        validTo = $expirationDate
        allOrgs = $false
    } | ConvertTo-Json -Depth 3
    
    Write-Host "Request payload:" -ForegroundColor Cyan
    Write-Host $requestBody -ForegroundColor Gray
    
    # Create authorization header
    $headers = Get-AuthHeader -Pat $ExistingPAT
    
    # Make the API call to create the PAT
    Write-Host "Making API call to create PAT..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $requestBody
    
    if ($response -and $response.patToken) {
        Write-Host "`n✅ Personal Access Token created successfully!" -ForegroundColor Green
        Write-Host "📋 Token Details:" -ForegroundColor Cyan
        Write-Host "   Name: $($response.patToken.displayName)" -ForegroundColor White
        Write-Host "   Token ID: $($response.patToken.patTokenId)" -ForegroundColor White
        Write-Host "   Expires: $($response.patToken.validTo)" -ForegroundColor White
        Write-Host "   Scopes: $($response.patToken.scope)" -ForegroundColor White
        
        Write-Host "`n🔑 Your new PAT (token-1):" -ForegroundColor Yellow
        Write-Host $response.patToken.token -ForegroundColor Red -BackgroundColor Black
        
        Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Red
        Write-Host "   - Save this token immediately in a secure location" -ForegroundColor Yellow
        Write-Host "   - This token will not be displayed again" -ForegroundColor Yellow
        Write-Host "   - Use this token as 'token-1' in your deployment scripts" -ForegroundColor Yellow
        
        # Optionally save to a secure file
        $saveChoice = Read-Host "`nWould you like to save this token to a secure file? (y/N)"
        if ($saveChoice -eq 'y' -or $saveChoice -eq 'Y') {
            $secureFilePath = ".\ado-pat-token-1.txt"
            $response.patToken.token | Out-File -FilePath $secureFilePath -Encoding UTF8
            Write-Host "Token saved to: $secureFilePath" -ForegroundColor Green
            Write-Host "Remember to delete this file after copying the token to your secure storage!" -ForegroundColor Yellow
        }
        
        return $response.patToken.token
    } else {
        throw "Failed to create PAT. No token returned in response."
    }
    
} catch {
    Write-Error "Failed to create Personal Access Token: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "API Error Response: $errorBody" -ForegroundColor Red
    }
    
    Write-Host "`n🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Ensure your existing PAT has 'vso.tokens_manage' scope" -ForegroundColor White
    Write-Host "2. Verify the organization name is correct" -ForegroundColor White
    Write-Host "3. Check that your existing PAT hasn't expired" -ForegroundColor White
    Write-Host "4. Ensure you have permission to create PATs in this organization" -ForegroundColor White
    
    exit 1
}
