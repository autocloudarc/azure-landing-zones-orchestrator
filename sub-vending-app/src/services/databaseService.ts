// Database utility functions
import { createConnection } from 'mssql';

// Database configuration from environment variables
const dbConfig = {
  server: process.env.DB_SERVER || 'svr-ghc-01.database.windows.net',
  database: process.env.DB_DATABASE || 'vending',
  user: process.env.DB_USER || 'sqladmin',
  password: process.env.DB_PASSWORD || 'Sicherheit@2009',
  port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: false // For Azure SQL
  }
};

export class DatabaseService {
  private pool: any = null;

  async connect() {
    try {
      if (!this.pool) {
        this.pool = await createConnection(dbConfig);
      }
      return this.pool;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }

  async insertRequest(requestData: any) {
    const pool = await this.connect();
    
    try {
      const request = pool.request();
      
      // Map the request data to database fields
      const result = await request
        .input('requester_name', requestData.requester.name)
        .input('requester_email', requestData.requester.email)
        .input('requester_department', requestData.requester.department)
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
        .input('tag_owner', requestData.tags.Owner)
        .input('tag_cost_center', requestData.tags.CostCenter)
        .input('tag_environment', requestData.tags.Environment)
        .input('tag_project_name', requestData.tags.ProjectName)
        .input('tag_project_id', requestData.tags.ProjectID)
        .input('tag_business_impact', requestData.tags.businessImpact)
        .input('tag_data_sensitivity', requestData.tags.dataSensitivity)
        .input('networking_require_hub_peering', requestData.networking?.requireHubPeering || false)
        .input('networking_vnet_name', requestData.networking?.vnetName || null)
        .input('networking_address_space', requestData.networking?.addressSpace || null)
        .input('policy_assignment_name', requestData.policyAssignment?.policyName || null)
        .input('policy_assignment_type', requestData.policyAssignment?.policyType || 'Policy')
        .input('policy_assign_immediately', requestData.policyAssignment?.assignImmediately || true)
        .input('managed_identities', requestData.managedIdentities ? JSON.stringify(requestData.managedIdentities) : null)
        .query(`
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

      return result.recordset[0];
    } catch (error) {
      console.error('Error inserting request:', error);
      throw error;
    }
  }

  async getRequests() {
    const pool = await this.connect();
    
    try {
      const result = await pool.request().query(`
        SELECT 
          id, created_date, updated_date, status,
          requester_name, requester_email, requester_department,
          subscription_name, business_unit, environment, product_line,
          monthly_budget_estimate, region, tag_project_name
        FROM [request] 
        ORDER BY created_date DESC
      `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  }

  async getRequestById(id: number) {
    const pool = await this.connect();
    
    try {
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM [request] WHERE id = @id');
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching request by ID:', error);
      throw error;
    }
  }

  async updateRequestStatus(id: number, status: string, notes?: string) {
    const pool = await this.connect();
    
    try {
      const request = pool.request()
        .input('id', id)
        .input('status', status)
        .input('updated_date', new Date())
        .input('notes', notes || null);

      let query = `
        UPDATE [request] 
        SET status = @status, updated_date = @updated_date
      `;

      if (status === 'Approved') {
        query += ', approval_date = @updated_date';
      } else if (status === 'Completed') {
        query += ', completion_date = @updated_date';
      }

      if (notes) {
        query += ', notes = @notes';
      }

      query += ' WHERE id = @id';

      const result = await request.query(query);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
