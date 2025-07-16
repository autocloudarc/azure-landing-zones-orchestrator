@echo off
REM Azure Landing Zone Terraform Accelerator - PAT Creation Script
REM This script automates the creation of token-1 as described in the manual process

echo ===============================================
echo Azure Landing Zone Terraform Accelerator
echo Personal Access Token (token-1) Creator
echo ===============================================
echo.

REM Check if environment variables are set
if "%ADO_ORG_NAME%"=="" (
    set /p ADO_ORG_NAME="Enter your Azure DevOps organization name: "
)

if "%ADO_EXISTING_PAT%"=="" (
    set /p ADO_EXISTING_PAT="Enter an existing PAT with token management permissions: "
)

echo.
echo Organization: %ADO_ORG_NAME%
echo.

REM Execute the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "Create-Token1-Automated.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================
    echo SUCCESS: token-1 has been created!
    echo ===============================================
) else (
    echo.
    echo ===============================================
    echo ERROR: Failed to create token-1
    echo ===============================================
)

pause
