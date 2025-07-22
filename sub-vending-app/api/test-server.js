// Test script to verify the API server with development fallback
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simulate database connection failure
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
  ]
};

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

// Get all requests
app.get('/api/requests', (req, res) => {
  res.status(200).json({
    success: true,
    data: inMemoryStorage.requests,
    mode: 'development'
  });
});

// Get specific request
app.get('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const request = inMemoryStorage.requests.find(r => r.id === parseInt(id));
  
  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Subscription request not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: request,
    mode: 'development'
  });
});

// Update request
app.put('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const requestData = req.body;
  
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
    last_updated: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    message: 'Request updated successfully',
    data: inMemoryStorage.requests[requestIndex],
    mode: 'development'
  });
});

app.listen(PORT, () => {
  console.log('🔄 Running in DEVELOPMENT MODE with in-memory storage');
  console.log('📝 Sample data available for testing');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 API Health: http://localhost:3001/api/health');
});
