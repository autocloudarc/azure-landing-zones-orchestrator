#Requires -Version 5.1

<#
.SYNOPSIS
    Automated PAT creation for Azure Landing Zone Terraform Accelerator deployment.

.DESCRIPTION
    This script creates the "token-1" PAT required for the Azure Landing Zone Terraform Accelerator.
    Uses environment variables for secure credential handling.

.NOTES
    Environment Variables Required:
    - ADO_ORG_NAME: Your Azure DevOps organization name
    - ADO_EXISTING_PAT: Existing PAT with vso.tokens_manage scope
    
    Optional Environment Variables:
    - ADO_TOKEN_EXPIRY_DAYS: Days until expiration (default: 1)
#>

# Get configuration from environment variables
$organizationName = $env:ADO_ORG_NAME
$existingPAT = $env:ADO_EXISTING_PAT
$expirationDays = if ($env:ADO_TOKEN_EXPIRY_DAYS) { [int]$env:ADO_TOKEN_EXPIRY_DAYS } else { 1 }

# Validate required environment variables
if (-not $organizationName) {
    Write-Error "ADO_ORG_NAME environment variable is required"
    exit 1
}

if (-not $existingPAT) {
    Write-Error "ADO_EXISTING_PAT environment variable is required"
    exit 1
}

# Set up error handling
$ErrorActionPreference = 'Stop'

function New-AzureDevOpsPAT {
    param(
        [string]$OrgName,
        [string]$ExistingToken,
        [int]$ExpiryDays = 1
    )
    
    try {
        Write-Host "🚀 Creating Azure Landing Zone Terraform Accelerator PAT..." -ForegroundColor Green
        
        # API endpoint
        $apiUrl = "https://vssps.dev.azure.com/$OrgName/_apis/Tokens/Pats?api-version=7.1-preview.1"
        
        # Calculate expiration
        $expirationDate = (Get-Date).AddDays($ExpiryDays).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        # Authorization header
        $base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$ExistingToken"))
        $headers = @{
            'Authorization' = "Basic $base64Auth"
            'Content-Type' = 'application/json'
            'Accept' = 'application/json'
        }
        
        # Required scopes for Azure Landing Zone Terraform Accelerator
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
        
        # Request payload
        $payload = @{
            displayName = "Azure Landing Zone Terraform Accelerator"
            scope = ($scopes -join " ")
            validTo = $expirationDate
            allOrgs = $false
        } | ConvertTo-Json -Depth 3
        
        # Create PAT
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $payload
        
        if ($response.patToken.token) {
            Write-Host "✅ PAT created successfully!" -ForegroundColor Green
            Write-Host "Token ID: $($response.patToken.patTokenId)" -ForegroundColor Cyan
            Write-Host "Expires: $($response.patToken.validTo)" -ForegroundColor Cyan
            
            # Output the token for capture
            Write-Output "TOKEN-1=$($response.patToken.token)"
            
            return $response.patToken.token
        } else {
            throw "No token returned in API response"
        }
        
    } catch {
        Write-Error "Failed to create PAT: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $errorDetails = $_.Exception.Response | ConvertTo-Json -Depth 3
            Write-Host "Error details: $errorDetails" -ForegroundColor Red
        }
        exit 1
    }
}

# Create the PAT
$token = New-AzureDevOpsPAT -OrgName $organizationName -ExistingToken $existingPAT -ExpiryDays $expirationDays

Write-Host "`n🔑 Your token-1 has been created and is ready for use!" -ForegroundColor Yellow
Write-Host "⚠️  Store this token securely - it cannot be retrieved again." -ForegroundColor Red
