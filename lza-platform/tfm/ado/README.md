# Azure Landing Zone Terraform Accelerator - PAT Automation

This directory contains scripts to automate the creation of Personal Access Tokens (PATs) for the Azure Landing Zone Terraform Accelerator deployment, specifically the "token-1" referenced in the deployment documentation.

## Overview

The manual process requires navigating to dev.azure.com, creating a PAT with specific scopes, and configuring various permissions. These scripts automate that entire process using the Azure DevOps REST API.

## Files Description

| File | Purpose |
|------|---------|
| `Create-ADO-PAT.ps1` | Full-featured PowerShell script with interactive prompts |
| `Create-Token1-Automated.ps1` | Streamlined script using environment variables |
| `Set-Environment.ps1` | Helper script to set up environment variables |
| `create-token1.bat` | Windows batch file for easy execution |
| `README.md` | This documentation file |

## Required Scopes

The created PAT (token-1) will have the following scopes as specified in the manual process:

- **Agent Pools**: Read & manage (`vso.agent_management`)
- **Build**: Read & execute (`vso.build_execute`)
- **Code**: Full (`vso.code_full`)
- **Environment**: Read & manage (`vso.environment_manage`)
- **Graph**: Read & manage (`vso.graph_manage`)
- **Pipeline Resources**: Use & manage (`vso.pipelineresources_manage`)
- **Project and Team**: Read, write & manage (`vso.project_manage`)
- **Service Connections**: Read, query & manage (`vso.serviceendpoint_manage`)
- **Variable Groups**: Read, create & manage (`vso.variablegroups_manage`)

## Prerequisites

1. **Existing PAT**: You need an existing PAT with the `vso.tokens_manage` scope to create new PATs
2. **PowerShell 5.1+**: Scripts require PowerShell 5.1 or later
3. **Organization Access**: You must have permission to create PATs in your Azure DevOps organization

## Quick Start

### Option 1: Interactive Script (Recommended for first-time users)

```powershell
# Run the interactive script
.\Create-ADO-PAT.ps1 -OrganizationName "your-org-name" -ExistingPAT "your-existing-pat"
```

### Option 2: Environment Variables (Recommended for automation)

```powershell
# 1. Set up environment variables
# Edit Set-Environment.ps1 with your values, then run:
. .\Set-Environment.ps1

# 2. Create the PAT
.\Create-Token1-Automated.ps1
```

### Option 3: Windows Batch File

```cmd
# Double-click create-token1.bat or run from command prompt
create-token1.bat
```

## Step-by-Step Instructions

### 1. Create an Initial PAT (One-time setup)

Before using these scripts, you need to manually create one PAT with minimal permissions:

1. Go to <https://dev.azure.com/[your-org]>
2. Click User Settings (top right) → Personal Access Tokens
3. Click "New Token"
4. Name: "PAT Creator"
5. Expiration: Custom (set to a reasonable date)
6. Scopes: Check only "Tokens" → "Read & manage"
7. Copy the token and save it securely

### 2. Configure the Scripts

Edit `Set-Environment.ps1`:

```powershell
$env:ADO_ORG_NAME = "your-organization-name"  # Replace with your org name
$env:ADO_EXISTING_PAT = "your-pat-creator-token"  # Replace with token from step 1
$env:ADO_TOKEN_EXPIRY_DAYS = "1"  # Set expiration (1 = tomorrow as per requirements)
```

### 3. Run the Script

```powershell
# Load environment variables
. .\Set-Environment.ps1

# Create token-1
.\Create-Token1-Automated.ps1
```

### 4. Capture the Output

The script will output something like:

```text
TOKEN-1=abcdef1234567890...
```

Save this token securely - it's your "token-1" for the Azure Landing Zone Terraform Accelerator.

## Security Best Practices

1. **Secure Storage**: Store PATs in a secure location (Azure Key Vault, password manager)
2. **Least Privilege**: The initial PAT only needs `vso.tokens_manage` scope
3. **Expiration**: Set appropriate expiration dates (the scripts default to 1 day as per requirements)
4. **Environment Variables**: Use environment variables instead of hardcoding tokens
5. **Cleanup**: Delete any temporary files containing tokens after use

## Troubleshooting

### Common Issues

1. **"Access Denied"**
   - Ensure your existing PAT has `vso.tokens_manage` scope
   - Verify you have permission to create PATs in the organization

2. **"Organization not found"**
   - Check the organization name is correct
   - Ensure you have access to the organization

3. **"Token expired"**
   - Your existing PAT may have expired
   - Create a new initial PAT following step 1

### API Error Responses

The scripts include detailed error handling and will display API responses for debugging.

## Integration with Azure Landing Zone Terraform Accelerator

Once you have token-1 created by these scripts:

1. Use it as the "token-1" value in your Terraform Accelerator deployment
2. The token has all required scopes for the accelerator to function
3. Remember to rotate the token before expiration if needed

## Automation in CI/CD

For CI/CD scenarios:

```yaml
# Example Azure Pipeline step
- task: PowerShell@2
  displayName: 'Create ADO PAT'
  inputs:
    targetType: 'filePath'
    filePath: 'ado/Create-Token1-Automated.ps1'
  env:
    ADO_ORG_NAME: $(ADO_ORG_NAME)
    ADO_EXISTING_PAT: $(ADO_EXISTING_PAT)
```

## Support

This automation replaces the manual process described in the Azure Landing Zone Terraform Accelerator documentation. The created PAT will have identical permissions to those specified in the manual steps.

For issues with the Azure Landing Zone Terraform Accelerator itself, refer to the main project documentation.
