// Quick start API server for development
// This bypasses database connection attempts and starts immediately

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

console.log('🚀 Quick Start Mode - No database connection attempts');

// Sample data for immediate testing
const sampleData = [
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
    created_date: new Date().toISOString(),
    last_updated: new Date().toISOString()
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Quick Start API running',
    mode: 'Fast Development Mode',
    timestamp: new Date().toISOString()
  });
});

// Get all requests
app.get('/api/requests', (req, res) => {
  res.json({
    success: true,
    data: sampleData,
    mode: 'quick-start'
  });
});

// Get specific request
app.get('/api/requests/:id', (req, res) => {
  const request = sampleData.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }
  res.json({
    success: true,
    data: request,
    mode: 'quick-start'
  });
});

// Update request
app.put('/api/requests/:id', (req, res) => {
  const index = sampleData.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }
  
  // Update with provided data
  sampleData[index] = {
    ...sampleData[index],
    ...req.body,
    last_updated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Request updated successfully',
    data: sampleData[index],
    mode: 'quick-start'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Quick Start API running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:3001/api/health');
  console.log('📋 Test data: 2 sample requests available');
});
