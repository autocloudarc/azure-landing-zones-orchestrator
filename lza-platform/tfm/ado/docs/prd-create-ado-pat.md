# Product Requirements Document: Azure DevOps PAT Automation Solution

## Document Information

| Field | Value |
|-------|-------|
| Document Title | Azure DevOps Personal Access Token (PAT) Automation Solution |
| Version | 1.0 |
| Date | July 3, 2025 |
| Product Owner | Azure Landing Zone Terraform Accelerator Team |
| Status | Active |

## Executive Summary

This PRD defines requirements for an automated solution to create Personal Access Tokens (PATs) in Azure DevOps, replacing a manual 12-step process with programmatic automation. The solution addresses the need for both "token-1" and "token-2" creation as part of the Azure Landing Zone Terraform Accelerator deployment process.

**Token Requirements:**

- **Token-1 (alz-tfm-01)**: Full-featured token with comprehensive scopes for Azure Landing Zone deployment
- **Token-2 (alz-tfm-token-2)**: Specialized token for self-hosted runners with limited Agent Pools scope

## Token Specifications

### Token-1 (alz-tfm-01) - Primary Deployment Token

| Property | Value |
|----------|-------|
| Name | alz-tfm-01 |
| Purpose | Primary Azure Landing Zone Terraform Accelerator deployment |
| Default Expiration | 90 days |
| Scope Count | 9 comprehensive scopes |

**Required Scopes:**
- Agent Pools: Read & manage
- Build: Read & execute
- Code: Full
- Environment: Read & manage
- Graph: Read & manage
- Pipeline Resources: Use & manage
- Project and Team: Read, write & manage
- Service Connections: Read, query & manage
- Variable Groups: Read, create & manage

### Token-2 (alz-tfm-token-2) - Self-Hosted Runners Token

| Property | Value |
|----------|-------|
| Name | alz-tfm-token-2 |
| Purpose | Self-hosted runners authentication |
| Default Expiration | 365 days (1 year maximum) |
| Scope Count | 1 focused scope |

**Required Scopes:**
- Agent Pools: Read & manage (vso.agent_management)

**Security Considerations for Token-2:**
- Maximum expiration allowed for operational continuity
- Single scope for least privilege access
- Requires process for token renewal before expiration
- Consider shorter expiration for enhanced security based on organizational policies

## Problem Statement

### Current State

Users must manually navigate through Azure DevOps portal to create PATs with specific scopes:

- Navigate to <https://dev.azure.com> → organization → user settings → personal access tokens
- Create new token with specific name and expiration
- Select 9 specific permission scopes from a complex UI
- Manually copy and securely store the generated token

### Pain Points

- Time-consuming manual process (12+ steps)
- Error-prone scope selection
- Inconsistent token naming and expiration settings
- Security risk from manual token handling
- No automation capability for CI/CD scenarios

## Solution Overview

Develop a PowerShell-based automation suite that uses Azure DevOps REST APIs to programmatically create PATs with predefined scopes, eliminating manual steps while maintaining security best practices.

## Instruction Prompts for Artifact Generation

### 1. Core PowerShell Script Generation (Dual-Token Support)

**Prompt:**

```yaml
Please create a PowerShell script that automates the creation of Azure DevOps Personal Access Tokens with support for both token types:

FUNCTIONAL REQUIREMENTS:
- Use Azure DevOps REST API version 7.1-preview.1
- Support creation of two token types:
  * Token-1 (alz-tfm-01): Full deployment token with 9 scopes, 90-day expiration
  * Token-2 (alz-tfm-token-2): Self-hosted runners token with 1 scope, 365-day expiration
- Token selection via parameter (e.g., -TokenType "Token1" or "Token2")
- Configurable token names and expiration periods

TOKEN-1 SCOPES (alz-tfm-01):
  * Agent Pools: Read & manage (vso.agent_management)
  * Build: Read & execute (vso.build_execute)
  * Code: Full (vso.code_full)
  * Environment: Read & manage (vso.environment_manage)
  * Graph: Read & manage (vso.graph_manage)
  * Pipeline Resources: Use & manage (vso.pipelineresources_manage)
  * Project and Team: Read, write & manage (vso.project_manage)
  * Service Connections: Read, query & manage (vso.serviceendpoint_manage)
  * Variable Groups: Read, create & manage (vso.variablegroups_manage)

TOKEN-2 SCOPES (alz-tfm-token-2):
  * Agent Pools: Read & manage (vso.agent_management)

TECHNICAL REQUIREMENTS:
- PowerShell 5.1+ compatibility
- Mandatory parameters: OrganizationName, ExistingPAT, TokenType
- Optional parameters: TokenName, ExpirationDays
- Automatic scope selection based on TokenType
- Base64 authentication header encoding
- JSON request/response handling
- Comprehensive error handling with specific troubleshooting guidance
- Option to save token to secure file with type-specific naming

SECURITY REQUIREMENTS:
- No hardcoded credentials
- Secure token display (highlighted background)
- Clear warnings about token storage and expiration
- Validation of existing PAT permissions
- Token renewal reminders for Token-2 (1-year expiration)
```

### 2. Environment-Based Automation Script

**Prompt:**

```yaml
Create a streamlined PowerShell script for automated environments with these specifications:

REQUIREMENTS:
- Use environment variables for configuration (ADO_ORG_NAME, ADO_EXISTING_PAT, ADO_TOKEN_TYPE, ADO_TOKEN_EXPIRY_DAYS)
- Support both token types via ADO_TOKEN_TYPE environment variable ("Token1" or "Token2")
- Validate required environment variables with clear error messages
- Same API functionality as main script but optimized for CI/CD
- Output token in format "TOKEN-1={token_value}" or "TOKEN-2={token_value}" based on type
- Minimal user interaction
- Comprehensive error handling for automation scenarios
- Function-based architecture for reusability

NAMING CONVENTION:
- File: Create-Token-Automated.ps1
- Function: New-AzureDevOpsPAT
- Support: -TokenType parameter ("Token1", "Token2")
```

### 3. Self-Hosted Runners Token Script

**Prompt:**

```yaml
Create a specialized script specifically for Token-2 (self-hosted runners):

REQUIREMENTS:
- Dedicated script for self-hosted runners token creation
- Fixed scope: Agent Pools: Read & manage only
- Default 365-day expiration (1 year maximum)
- Enhanced security warnings about long expiration
- Token renewal reminder system
- Integration with existing runner registration processes

FUNCTIONAL REQUIREMENTS:
- Script name: Create-SelfHostedRunner-PAT.ps1
- Automatic scope selection (vso.agent_management)
- Warning about token renewal requirements
- Optional calendar reminder export
- Integration documentation for runner deployment

SECURITY FEATURES:
- Explicit warnings about 1-year expiration
- Reminder to implement token rotation process
- Security best practices documentation
- Audit trail recommendations
```

### 4. Environment Configuration Helper

**Prompt:**

```yaml
Generate a PowerShell script to help users configure environment variables for both token types:

REQUIREMENTS:
- Template with placeholder values (YOUR_ORG_NAME_HERE, YOUR_EXISTING_PAT_HERE)
- Support for both token types via ADO_TOKEN_TYPE variable
- Clear instructions for updating placeholders
- Validation warnings if placeholders remain unchanged
- Display masked PAT value for security
- Success confirmation with next steps
- Integration guidance for both automated scripts

DUAL-TOKEN SUPPORT:
- ADO_TOKEN_TYPE options: "Token1", "Token2", or "Both"
- Conditional expiration settings based on token type
- Token-specific guidance and warnings

FILE STRUCTURE:
- Name: Set-Environment.ps1
- Include detailed comments explaining each variable
- Provide example values in comments for both token types
- Include security warnings for Token-2 long expiration
```

### 5. Windows Batch File Wrapper

**Prompt:**

```yaml
Create a Windows batch file that provides a user-friendly interface for both token types:

REQUIREMENTS:
- Interactive prompts for missing environment variables
- Token type selection menu (Token1, Token2, or Both)
- Clear branding and progress messages
- Execute PowerShell script with proper execution policy
- Handle success/failure scenarios with appropriate messaging
- Pause for user acknowledgment
- Professional presentation with headers and separators

DUAL-TOKEN FEATURES:
- Menu-driven token type selection
- Type-specific guidance and warnings
- Sequential creation for "Both" option
- Token-specific file naming and storage

DESIGN:
- ASCII art or clear text branding
- Step-by-step progress indicators
- Error handling with user-friendly messages
- Token renewal reminders for Token-2
```

### 6. Comprehensive Documentation

**Prompt:**

```yaml
Generate a comprehensive README.md with the following sections:

CONTENT REQUIREMENTS:
- Overview of the dual-token automation solution
- File structure with descriptions for both token types
- Security best practices section (including Token-2 renewal processes)
- Step-by-step usage instructions for multiple scenarios:
  1. Interactive script usage (Token1 and Token2)
  2. Environment variable automation (both types)
  3. Windows batch file execution (with token selection)
  4. Self-hosted runners specific workflow
- Troubleshooting guide with common issues for both token types
- Integration instructions for CI/CD pipelines
- Token renewal and rotation procedures
- Prerequisites and setup requirements

FORMATTING:
- Use tables for file descriptions and scope mappings
- Include code examples for each usage scenario
- Professional markdown formatting with proper headers
- Security warnings prominently displayed
- Links to Azure DevOps documentation where relevant

SECTIONS:
1. Overview
2. Files Description
3. Required Scopes
4. Prerequisites
5. Quick Start (3 options)
6. Step-by-Step Instructions
7. Security Best Practices
8. Troubleshooting
9. Integration with Azure Landing Zone Terraform Accelerator
10. Automation in CI/CD
11. Support
```

### 6. Testing and Validation Scripts

**Prompt:**

```yaml
Create validation scripts for testing the PAT automation solution:

REQUIREMENTS:
- PowerShell script to validate created PAT has correct scopes
- Test script for environment variable configuration
- Validation of API connectivity and permissions
- Mock testing capability for development environments
- Integration test for full workflow
- Error simulation for troubleshooting validation

FILES TO GENERATE:
1. Test-PATValidation.ps1 - Validates created PAT scopes
2. Test-Environment.ps1 - Validates environment setup
3. Test-APIConnectivity.ps1 - Tests Azure DevOps API access
```

### 7. Security and Compliance Documentation

**Prompt:**

```yaml
Generate security documentation covering:

SECURITY TOPICS:
- Threat model for PAT automation
- Security controls and mitigations
- Compliance considerations
- Key rotation procedures
- Incident response for compromised tokens
- Security testing procedures

COMPLIANCE TOPICS:
- Data handling procedures
- Audit trail requirements
- Access control requirements
- Security review checklist

OUTPUT:
- Security.md file with detailed security analysis
- Compliance checklist
- Security testing procedures
```

### 8. CI/CD Integration Templates

**Prompt:**

```yaml
Create templates for common CI/CD platforms:

AZURE PIPELINES:
- YAML pipeline template for PAT creation
- Variable group configuration
- Secure file handling
- Integration with deployment pipelines

GITHUB ACTIONS:
- Workflow template for PAT automation
- Secrets management integration
- Step-by-step job configuration

GENERIC TEMPLATES:
- Docker container for PAT automation
- Jenkins pipeline script
- PowerShell DSC configuration

REQUIREMENTS:
- Secure credential handling
- Error handling and retry logic
- Logging and monitoring integration
- Artifact publication
```

## Success Criteria

### Primary Objectives

1. **Dual-Token Automation**: Both Token-1 and Token-2 creation processes fully automated
2. **Security Maintained**: No reduction in security posture compared to manual process
3. **Error Reduction**: Eliminate human errors in scope selection and configuration for both token types
4. **Time Savings**: Reduce PAT creation time from 5+ minutes to <30 seconds per token
5. **Reproducibility**: Consistent PAT creation across different environments for both use cases

### Acceptance Criteria

**Token-1 (alz-tfm-01) Requirements:**
- [ ] All 9 required scopes correctly configured
- [ ] 90-day default expiration with customization support
- [ ] Comprehensive error handling with actionable messages
- [ ] Integration with Azure Landing Zone deployment workflows

**Token-2 (alz-tfm-token-2) Requirements:**
- [ ] Single Agent Pools scope correctly configured
- [ ] 365-day (1 year) default expiration
- [ ] Token renewal reminder system implemented
- [ ] Self-hosted runners integration documentation

**Common Requirements:**
- [ ] Support for custom token names and expiration
- [ ] Security best practices implemented
- [ ] Documentation complete and accurate for both token types
- [ ] Testing suite validates all functionality for both tokens
- [ ] CI/CD integration templates provided
- [ ] Token renewal processes documented

### Key Performance Indicators (KPIs)

- **Time to Create PAT**: < 30 seconds per token (vs 5+ minutes manual)
- **Error Rate**: < 1% (vs ~15% manual scope selection errors)
- **User Satisfaction**: > 95% positive feedback
- **Adoption Rate**: > 80% of Azure Landing Zone deployments use automation
- **Token Renewal Success**: > 95% of Token-2 renewals completed before expiration

## Technical Architecture

### Components

1. **Core Automation Engine**: PowerShell scripts using Azure DevOps REST API
2. **Configuration Management**: Environment variables and parameter validation
3. **User Interface Layer**: Interactive scripts and batch files
4. **Security Layer**: Credential handling and token management
5. **Documentation Suite**: Usage guides and troubleshooting

### Dependencies

- PowerShell 5.1+
- Azure DevOps organization access
- Existing PAT with `vso.tokens_manage` scope
- Internet connectivity to Azure DevOps APIs

### Integration Points

- Azure Landing Zone Terraform Accelerator deployment process
- CI/CD pipelines (Azure Pipelines, GitHub Actions, Jenkins)
- Infrastructure as Code workflows
- Security and compliance tools

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API Changes | High | Medium | Version pinning, fallback mechanisms |
| Security Vulnerabilities | High | Low | Security review, secure coding practices |
| Token Leakage | High | Low | Secure handling, clear guidelines |
| Scope Creep | Medium | Medium | Clear requirements, change control |
| User Adoption | Medium | Low | Comprehensive documentation, training |

## Future Enhancements

### Phase 2 Features

- GUI-based token management interface for both token types
- Bulk token creation and management
- Automated token rotation for Token-2 (self-hosted runners)
- Integration with Azure Key Vault for secure token storage
- Advanced logging and monitoring for token usage
- Calendar integration for token renewal reminders

### Phase 3 Features

- Multi-organization support for enterprise scenarios
- Role-based access control integration
- Advanced security scanning and compliance reporting
- Performance optimization for large-scale deployments
- Cloud-native deployment options (containers, serverless)
- Machine learning-based token usage analytics

## Conclusion

This dual-token automation solution will significantly improve the Azure Landing Zone Terraform Accelerator deployment experience by eliminating manual PAT creation steps for both primary deployment (Token-1) and self-hosted runners (Token-2) while maintaining security and compliance standards. 

**Key Benefits:**
- **Token-1 (alz-tfm-01)**: Comprehensive automation for full Azure Landing Zone deployment with 9 scopes
- **Token-2 (alz-tfm-token-2)**: Specialized automation for self-hosted runners with focused Agent Pools scope
- **Unified Approach**: Single solution supporting both token types with appropriate security controls
- **Enterprise Ready**: Includes token renewal processes, security documentation, and CI/CD integration

The modular design ensures flexibility for various deployment scenarios while providing comprehensive documentation and testing capabilities for both token types. The solution addresses the unique requirements of self-hosted runners with longer expiration periods while maintaining security through proper renewal processes.

---

*This PRD serves as the master specification for generating all artifacts in the Azure DevOps PAT Automation Solution. Each instruction prompt should be executed independently to create the complete dual-token solution suite.*
