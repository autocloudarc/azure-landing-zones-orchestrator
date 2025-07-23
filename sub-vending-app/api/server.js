const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  server: process.env.DB_SERVER || 'svr-ghc-01.database.windows.net',
  database: process.env.DB_DATABASE || 'vending',
  user: process.env.DB_USER || 'sqladmin',
  password: process.env.DB_PASSWORD || 'Sicherheit@2009',
  port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  }
};

let pool;
let isDbConnected = false;

// In-memory storage for development fallback
let inMemoryStorage = {
  requests: [
    {
      id: 1,
      requester_name: 'John Doe',
      requester_email: 'john.doe@company.com',
      requester_department: 'IT Department',
      subscription_name: 'dev-subscription-001',
      business_unit: 'Technology',
      monthly_budget_estimate: 500.00,
      environment: 'dev',
      region: 'East US',
      product_line: 'online',
      request_reason: 'Development environment for new application',
      notes: 'Initial development phase',
      status: 'pending',
      hybrid_connectivity: false,
      tag_owner: 'john.doe@company.com',
      tag_cost_center: 'IT-001',
      tag_environment: 'dev',
      tag_project_name: 'Azure Migration Project',
      tag_project_id: 'PROJ-2025-001',
      tag_business_impact: 'Medium',
      tag_data_sensitivity: 'Internal',
      submission_date: new Date().toISOString(),
      created_date: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: 2,
      requester_name: 'Jane Smith',
      requester_email: 'jane.smith@company.com',
      requester_department: 'Marketing',
      subscription_name: 'marketing-analytics',
      business_unit: 'Marketing',
      monthly_budget_estimate: 1000.00,
      environment: 'prd',
      region: 'West US 2',
      product_line: 'online',
      request_reason: 'Analytics platform for marketing campaigns',
      notes: 'Production workload with high availability requirements',
      status: 'approved',
      hybrid_connectivity: true,
      tag_owner: 'jane.smith@company.com',
      tag_cost_center: 'MKT-500',
      tag_environment: 'prd',
      tag_project_name: 'Customer Analytics Platform',
      tag_project_id: 'PROJ-2025-002',
      tag_business_impact: 'High',
      tag_data_sensitivity: 'Confidential',
      submission_date: new Date().toISOString(),
      created_date: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
  ],
  nextId: 3
};

// Initialize database connection pool
async function initializeDatabase() {
  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('✅ Connected to Azure SQL Database successfully');
    isDbConnected = true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Running in DEVELOPMENT MODE with in-memory storage');
    console.log('📝 Sample data available for testing');
    isDbConnected = false;
  }
}

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Azure Subscription Vending API is running',
    mode: isDbConnected ? 'Database Connected' : 'Development Mode (In-Memory)',
    database: isDbConnected ? 'Azure SQL' : 'In-Memory Storage',
    timestamp: new Date().toISOString()
  });
});

// Database inspection endpoint
app.get('/api/database/inspect', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json({
        success: true,
        message: 'Using in-memory storage (development mode)',
        mode: 'development',
        sampleRecord: inMemoryStorage.requests[0]
      });
    }

    // Check what columns exist in the database
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'request'
      ORDER BY ORDINAL_POSITION
    `);

    // Get a sample record
    const sampleResult = await pool.request().query(`
      SELECT TOP 1 * FROM [request] WHERE id = 1
    `);

    res.json({
      success: true,
      mode: 'database',
      columns: columnsResult.recordset,
      sampleRecord: sampleResult.recordset[0] || null,
      message: 'Database inspection complete'
    });

  } catch (error) {
    console.error('Database inspection error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to inspect database'
    });
  }
});

// Database migration endpoint to add missing metadata columns and populate data
app.post('/api/database/migrate', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json({
        success: false,
        message: 'Database not connected - running in development mode'
      });
    }

    const request = pool.request();
    
    // Check if metadata columns exist, if not add them
    const checkColumns = await request.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'request' 
      AND COLUMN_NAME IN ('tag_owner', 'tag_project_id', 'tag_project_name', 'tag_cost_center', 'tag_business_impact', 'tag_data_sensitivity')
    `);

    const missingColumns = 6 - checkColumns.recordset[0].count;
    
    if (missingColumns > 0) {
      // Add missing metadata columns
      await request.query(`
        ALTER TABLE [request] 
        ADD tag_owner NVARCHAR(255),
            tag_project_id NVARCHAR(100),
            tag_project_name NVARCHAR(255),
            tag_cost_center NVARCHAR(100),
            tag_business_impact NVARCHAR(50),
            tag_data_sensitivity NVARCHAR(50)
      `);
      console.log('✅ Added metadata columns to database');
    }

    // Update existing records with sample metadata
    const updateRequest = pool.request();
    await updateRequest.query(`
      UPDATE [request] 
      SET tag_owner = CASE 
                        WHEN id = 1 THEN 'john.doe@company.com'
                        WHEN id = 2 THEN 'jane.smith@company.com'
                        ELSE requester_email
                      END,
          tag_project_id = CASE 
                             WHEN id = 1 THEN 'PROJ-2025-001'
                             WHEN id = 2 THEN 'PROJ-2025-002'
                             ELSE 'PROJ-2025-' + CAST(id as VARCHAR(10))
                           END,
          tag_project_name = CASE 
                               WHEN id = 1 THEN 'Azure Migration Project'
                               WHEN id = 2 THEN 'Customer Analytics Platform'
                               ELSE subscription_name + ' Project'
                             END,
          tag_cost_center = CASE 
                              WHEN id = 1 THEN 'IT-001'
                              WHEN id = 2 THEN 'MKT-500'
                              ELSE 'CC-' + CAST(id as VARCHAR(10))
                            END,
          tag_business_impact = CASE 
                                  WHEN environment = 'prd' THEN 'High'
                                  WHEN environment = 'dev' THEN 'Medium'
                                  ELSE 'Low'
                                END,
          tag_data_sensitivity = CASE 
                                   WHEN environment = 'prd' THEN 'Confidential'
                                   WHEN environment = 'dev' THEN 'Internal'
                                   ELSE 'Internal'
                                 END
      WHERE tag_owner IS NULL OR tag_owner = ''
    `);

    console.log('✅ Updated database records with metadata');

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      columnsAdded: missingColumns,
      mode: 'database'
    });

  } catch (error) {
    console.error('Database migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database migration failed'
    });
  }
});

// Force migration endpoint - updates ALL records regardless of current values
app.post('/api/database/force-migrate', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json({
        success: false,
        message: 'Database not connected - running in development mode'
      });
    }

    // Force update ALL records with metadata
    const updateRequest = pool.request();
    await updateRequest.query(`
      UPDATE [request] 
      SET tag_owner = CASE 
                        WHEN id = 1 THEN 'john.doe@company.com'
                        WHEN id = 2 THEN 'jane.smith@company.com'
                        ELSE requester_email
                      END,
          tag_project_id = CASE 
                             WHEN id = 1 THEN 'PROJ-2025-001'
                             WHEN id = 2 THEN 'PROJ-2025-002'
                             ELSE 'PROJ-2025-' + CAST(id as VARCHAR(10))
                           END,
          tag_project_name = CASE 
                               WHEN id = 1 THEN 'Azure Migration Project'
                               WHEN id = 2 THEN 'Customer Analytics Platform'
                               ELSE subscription_name + ' Project'
                             END,
          tag_cost_center = CASE 
                              WHEN id = 1 THEN 'IT-001'
                              WHEN id = 2 THEN 'MKT-500'
                              ELSE 'CC-' + CAST(id as VARCHAR(10))
                            END,
          tag_business_impact = CASE 
                                  WHEN environment = 'prd' THEN 'High'
                                  WHEN environment = 'dev' THEN 'Medium'
                                  ELSE 'Low'
                                END,
          tag_data_sensitivity = CASE 
                                   WHEN environment = 'prd' THEN 'Confidential'
                                   WHEN environment = 'dev' THEN 'Internal'
                                   ELSE 'Internal'
                                 END
    `);

    console.log('🔥 Force updated ALL database records with metadata');

    res.json({
      success: true,
      message: 'Force migration completed - ALL records updated',
      mode: 'database'
    });

  } catch (error) {
    console.error('Force migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Force migration failed'
    });
  }
});

// Submit a new subscription request
app.post('/api/requests', async (req, res) => {
  try {
    console.log('Received request data:', req.body);
    
    const requestData = req.body;
    
    // Create SQL request
    const request = pool.request();
    
    // Add input parameters
    request
      .input('requester_name', requestData.requester?.name || null)
      .input('requester_email', requestData.requester?.email || null)
      .input('requester_department', requestData.requester?.department || null)
      .input('manager_name', requestData.manager?.name || null)
      .input('manager_email', requestData.manager?.email || null)
      .input('manager_department', requestData.manager?.department || null)
      .input('approver_name', requestData.approver?.name || null)
      .input('approver_email', requestData.approver?.email || null)
      .input('approver_department', requestData.approver?.department || null)
      .input('subscription_name', requestData.subscriptionName)
      .input('business_unit', requestData.businessUnit)
      .input('monthly_budget_estimate', requestData.monthlyBudgetEstimate)
      .input('environment', requestData.environment)
      .input('region', requestData.region)
      .input('product_line', requestData.productLine)
      .input('rbac_group_name', requestData.rbacGroup?.groupName || null)
      .input('rbac_group_role', requestData.rbacGroup?.role || 'Contributor')
      .input('hybrid_connectivity', requestData.hybridConnectivity || false)
      .input('tag_owner', requestData.tags?.Owner || null)
      .input('tag_cost_center', requestData.tags?.CostCenter || null)
      .input('tag_environment', requestData.tags?.Environment || null)
      .input('tag_project_name', requestData.tags?.ProjectName || null)
      .input('tag_project_id', requestData.tags?.ProjectID || null)
      .input('tag_business_impact', requestData.tags?.businessImpact || 'Medium')
      .input('tag_data_sensitivity', requestData.tags?.dataSensitivity || 'Internal')
      .input('networking_require_hub_peering', requestData.networking?.requireHubPeering || false)
      .input('networking_vnet_name', requestData.networking?.vnetName || null)
      .input('networking_address_space', requestData.networking?.addressSpace || null)
      .input('policy_assignment_name', requestData.policyAssignment?.policyName || null)
      .input('policy_assignment_type', requestData.policyAssignment?.policyType || 'Policy')
      .input('policy_assign_immediately', requestData.policyAssignment?.assignImmediately || true)
      .input('managed_identities', JSON.stringify(requestData.managedIdentities || []));

    // Execute INSERT query
    const result = await request.query(`
      INSERT INTO [request] (
        requester_name, requester_email, requester_department,
        manager_name, manager_email, manager_department,
        approver_name, approver_email, approver_department,
        subscription_name, business_unit, monthly_budget_estimate,
        environment, region, product_line,
        rbac_group_name, rbac_group_role, hybrid_connectivity,
        tag_owner, tag_cost_center, tag_environment, tag_project_name, tag_project_id,
        tag_business_impact, tag_data_sensitivity,
        networking_require_hub_peering, networking_vnet_name, networking_address_space,
        policy_assignment_name, policy_assignment_type, policy_assign_immediately,
        managed_identities
      ) 
      OUTPUT INSERTED.id, INSERTED.created_date, INSERTED.status
      VALUES (
        @requester_name, @requester_email, @requester_department,
        @manager_name, @manager_email, @manager_department,
        @approver_name, @approver_email, @approver_department,
        @subscription_name, @business_unit, @monthly_budget_estimate,
        @environment, @region, @product_line,
        @rbac_group_name, @rbac_group_role, @hybrid_connectivity,
        @tag_owner, @tag_cost_center, @tag_environment, @tag_project_name, @tag_project_id,
        @tag_business_impact, @tag_data_sensitivity,
        @networking_require_hub_peering, @networking_vnet_name, @networking_address_space,
        @policy_assignment_name, @policy_assignment_type, @policy_assign_immediately,
        @managed_identities
      )
    `);

    const insertedRecord = result.recordset[0];
    
    res.status(201).json({
      success: true,
      message: 'Subscription request submitted successfully',
      data: {
        id: insertedRecord.id,
        status: insertedRecord.status,
        createdDate: insertedRecord.created_date
      }
    });

  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit subscription request',
      error: error.message
    });
  }
});

// Get all subscription requests
app.get('/api/requests', async (req, res) => {
  try {
    if (!isDbConnected) {
      // Use in-memory storage for development
      return res.status(200).json({
        success: true,
        data: inMemoryStorage.requests,
        mode: 'development'
      });
    }

    const request = pool.request();
    const result = await request.query(`
      SELECT 
        id, subscription_name, business_unit, environment, 
        product_line, status, created_date, requester_name,
        requester_email, requester_department, monthly_budget_estimate,
        region, tag_project_name, tag_cost_center, hybrid_connectivity
      FROM [request]
      ORDER BY created_date DESC
    `);

    res.status(200).json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription requests',
      error: error.message
    });
  }
});

// Get a specific subscription request by ID
app.get('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isDbConnected) {
      // Use in-memory storage for development
      console.log(`📋 Getting request ${id} from in-memory storage (development mode)`);
      const request = inMemoryStorage.requests.find(r => r.id === parseInt(id));
      if (!request) {
        console.log(`❌ Request ${id} not found in in-memory storage`);
        return res.status(404).json({
          success: false,
          message: 'Subscription request not found'
        });
      }
      console.log(`✅ Found request ${id} with metadata:`, {
        tag_owner: request.tag_owner,
        tag_project_id: request.tag_project_id,
        tag_business_impact: request.tag_business_impact,
        tag_data_sensitivity: request.tag_data_sensitivity
      });
      return res.status(200).json({
        success: true,
        data: request,
        mode: 'development'
      });
    }

    const request = pool.request();
    request.input('id', sql.Int, parseInt(id));

    const result = await request.query(`
      SELECT * FROM [request]
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription request',
      error: error.message
    });
  }
});

// Update request status
app.patch('/api/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const request = pool.request();
    request.input('id', sql.Int, parseInt(id));
    request.input('status', sql.VarChar, status);

    const result = await request.query(`
      UPDATE [request] 
      SET status = @status, modified_date = GETUTCDATE()
      OUTPUT INSERTED.id, INSERTED.status, INSERTED.modified_date
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request status updated successfully',
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: error.message
    });
  }
});

// Update complete request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requestData = req.body;

    if (!isDbConnected) {
      // Use in-memory storage for development
      const requestIndex = inMemoryStorage.requests.findIndex(r => r.id === parseInt(id));
      if (requestIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Subscription request not found'
        });
      }

      // Update the request in memory
      inMemoryStorage.requests[requestIndex] = {
        ...inMemoryStorage.requests[requestIndex],
        subscription_name: requestData.subscription_name || inMemoryStorage.requests[requestIndex].subscription_name,
        business_unit: requestData.business_unit || inMemoryStorage.requests[requestIndex].business_unit,
        monthly_budget_estimate: requestData.monthly_budget_estimate || inMemoryStorage.requests[requestIndex].monthly_budget_estimate,
        environment: requestData.environment || inMemoryStorage.requests[requestIndex].environment,
        region: requestData.region || inMemoryStorage.requests[requestIndex].region,
        request_reason: requestData.request_reason || inMemoryStorage.requests[requestIndex].request_reason,
        notes: requestData.notes || inMemoryStorage.requests[requestIndex].notes,
        requester_name: requestData.requester_name || inMemoryStorage.requests[requestIndex].requester_name,
        requester_email: requestData.requester_email || inMemoryStorage.requests[requestIndex].requester_email,
        requester_department: requestData.requester_department || inMemoryStorage.requests[requestIndex].requester_department,
        // Metadata fields
        tag_owner: requestData.tag_owner || inMemoryStorage.requests[requestIndex].tag_owner,
        tag_project_id: requestData.tag_project_id || inMemoryStorage.requests[requestIndex].tag_project_id,
        tag_project_name: requestData.tag_project_name || inMemoryStorage.requests[requestIndex].tag_project_name,
        tag_cost_center: requestData.tag_cost_center || inMemoryStorage.requests[requestIndex].tag_cost_center,
        tag_business_impact: requestData.tag_business_impact || inMemoryStorage.requests[requestIndex].tag_business_impact,
        tag_data_sensitivity: requestData.tag_data_sensitivity || inMemoryStorage.requests[requestIndex].tag_data_sensitivity,
        last_updated: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Request updated successfully',
        data: inMemoryStorage.requests[requestIndex],
        mode: 'development'
      });
    }

    // First, check if the request exists
    const checkRequest = pool.request();
    checkRequest.input('id', sql.Int, parseInt(id));
    const existingResult = await checkRequest.query('SELECT id FROM [request] WHERE id = @id');

    if (existingResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription request not found'
      });
    }

    // Prepare the update query
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id));
    request.input('subscription_name', sql.VarChar, requestData.subscriptionName || '');
    request.input('business_unit', sql.VarChar, requestData.businessUnit || '');
    request.input('monthly_budget_estimate', sql.Decimal(10, 2), parseFloat(requestData.monthlyBudgetEstimate) || 0);
    request.input('environment', sql.VarChar, requestData.environment || 'dev');
    request.input('region', sql.VarChar, requestData.region || '');
    request.input('product_line', sql.VarChar, requestData.productLine || 'online');
    request.input('hybrid_connectivity', sql.Bit, requestData.hybridConnectivity || false);
    request.input('request_reason', sql.Text, requestData.requestReason || '');
    request.input('notes', sql.Text, requestData.notes || '');

    // Requester information
    request.input('requester_name', sql.VarChar, requestData.requester?.name || '');
    request.input('requester_email', sql.VarChar, requestData.requester?.email || '');
    request.input('requester_department', sql.VarChar, requestData.requester?.department || '');

    // Manager information (optional)
    request.input('manager_name', sql.VarChar, requestData.manager?.name || null);
    request.input('manager_email', sql.VarChar, requestData.manager?.email || null);
    request.input('manager_department', sql.VarChar, requestData.manager?.department || null);

    // Approver information (optional)
    request.input('approver_name', sql.VarChar, requestData.approver?.name || null);
    request.input('approver_email', sql.VarChar, requestData.approver?.email || null);
    request.input('approver_department', sql.VarChar, requestData.approver?.department || null);

    // Tags
    request.input('tag_owner', sql.VarChar, requestData.tags?.Owner || '');
    request.input('tag_cost_center', sql.VarChar, requestData.tags?.CostCenter || '');
    request.input('tag_environment', sql.VarChar, requestData.tags?.Environment || requestData.environment || 'dev');
    request.input('tag_project_name', sql.VarChar, requestData.tags?.ProjectName || '');
    request.input('tag_project_id', sql.VarChar, requestData.tags?.ProjectID || '');
    request.input('tag_business_impact', sql.VarChar, requestData.tags?.businessImpact || 'Medium');
    request.input('tag_data_sensitivity', sql.VarChar, requestData.tags?.dataSensitivity || 'Internal');

    // RBAC Group (optional)
    request.input('rbac_group_name', sql.VarChar, requestData.rbacGroup?.groupName || null);
    request.input('rbac_group_role', sql.VarChar, requestData.rbacGroup?.role || null);

    // Networking (optional)
    request.input('networking_require_hub_peering', sql.Bit, requestData.networking?.requireHubPeering || false);
    request.input('networking_vnet_name', sql.VarChar, requestData.networking?.vnetName || null);
    request.input('networking_address_space', sql.VarChar, requestData.networking?.addressSpace || null);

    // Policy Assignment (optional)
    request.input('policy_assignment_policy_name', sql.VarChar, requestData.policyAssignment?.policyName || null);
    request.input('policy_assignment_policy_type', sql.VarChar, requestData.policyAssignment?.policyType || null);
    request.input('policy_assignment_parameters', sql.Text, requestData.policyAssignment?.parameters ? JSON.stringify(requestData.policyAssignment.parameters) : null);

    // Security Review (optional)
    request.input('security_review_required', sql.Bit, requestData.securityReview?.required || false);
    request.input('security_review_contact_email', sql.VarChar, requestData.securityReview?.contactEmail || null);
    request.input('security_review_notes', sql.Text, requestData.securityReview?.notes || null);

    // Compliance Requirements (optional)
    request.input('compliance_requirements_required', sql.Bit, requestData.complianceRequirements?.required || false);
    request.input('compliance_requirements_frameworks', sql.Text, requestData.complianceRequirements?.frameworks ? JSON.stringify(requestData.complianceRequirements.frameworks) : null);
    request.input('compliance_requirements_contact_email', sql.VarChar, requestData.complianceRequirements?.contactEmail || null);

    // Technical Review (optional)
    request.input('technical_review_required', sql.Bit, requestData.technicalReview?.required || false);
    request.input('technical_review_contact_email', sql.VarChar, requestData.technicalReview?.contactEmail || null);
    request.input('technical_review_notes', sql.Text, requestData.technicalReview?.notes || null);

    // Managed Identities (optional)
    request.input('managed_identities', sql.Text, requestData.managedIdentities ? JSON.stringify(requestData.managedIdentities) : null);

    const updateQuery = `
      UPDATE [request] SET
        subscription_name = @subscription_name,
        business_unit = @business_unit,
        monthly_budget_estimate = @monthly_budget_estimate,
        environment = @environment,
        region = @region,
        product_line = @product_line,
        hybrid_connectivity = @hybrid_connectivity,
        request_reason = @request_reason,
        notes = @notes,
        requester_name = @requester_name,
        requester_email = @requester_email,
        requester_department = @requester_department,
        manager_name = @manager_name,
        manager_email = @manager_email,
        manager_department = @manager_department,
        approver_name = @approver_name,
        approver_email = @approver_email,
        approver_department = @approver_department,
        tag_owner = @tag_owner,
        tag_cost_center = @tag_cost_center,
        tag_environment = @tag_environment,
        tag_project_name = @tag_project_name,
        tag_project_id = @tag_project_id,
        tag_business_impact = @tag_business_impact,
        tag_data_sensitivity = @tag_data_sensitivity,
        rbac_group_name = @rbac_group_name,
        rbac_group_role = @rbac_group_role,
        networking_require_hub_peering = @networking_require_hub_peering,
        networking_vnet_name = @networking_vnet_name,
        networking_address_space = @networking_address_space,
        policy_assignment_policy_name = @policy_assignment_policy_name,
        policy_assignment_policy_type = @policy_assignment_policy_type,
        policy_assignment_parameters = @policy_assignment_parameters,
        security_review_required = @security_review_required,
        security_review_contact_email = @security_review_contact_email,
        security_review_notes = @security_review_notes,
        compliance_requirements_required = @compliance_requirements_required,
        compliance_requirements_frameworks = @compliance_requirements_frameworks,
        compliance_requirements_contact_email = @compliance_requirements_contact_email,
        technical_review_required = @technical_review_required,
        technical_review_contact_email = @technical_review_contact_email,
        technical_review_notes = @technical_review_notes,
        managed_identities = @managed_identities,
        modified_date = GETUTCDATE()
      WHERE id = @id;

      SELECT * FROM [request] WHERE id = @id;
    `;

    const result = await request.query(updateQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update subscription request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Azure Subscription Vending API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📝 Submit requests: POST http://localhost:${PORT}/api/requests`);
      console.log(`📋 View requests: GET http://localhost:${PORT}/api/requests`);
      console.log(`💾 Database: ${dbConfig.server}/${dbConfig.database}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    if (pool) {
      await pool.close();
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
