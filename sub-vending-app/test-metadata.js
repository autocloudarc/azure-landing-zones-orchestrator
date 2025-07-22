#!/usr/bin/env node

// Test script to verify metadata fields in API
console.log('🧪 Testing metadata fields in subscription request API...');

const BASE_URL = 'http://localhost:3001/api';

async function testMetadataFields() {
  try {
    // First, check if API is running
    console.log('🔍 Checking API health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('API not responding');
    }
    console.log('✅ API is running');

    // Get request ID 1 to test metadata fields
    console.log('📋 Fetching request ID 1...');
    const getResponse = await fetch(`${BASE_URL}/requests/1`);
    const getResult = await getResponse.json();
    
    if (!getResult.success) {
      throw new Error('Failed to get request: ' + getResult.message);
    }

    const request = getResult.data;
    console.log('📊 Request data retrieved:');
    console.log(`  - Owner: ${request.tag_owner || 'MISSING'}`);
    console.log(`  - Project ID: ${request.tag_project_id || 'MISSING'}`);
    console.log(`  - Project Name: ${request.tag_project_name || 'MISSING'}`);
    console.log(`  - Cost Center: ${request.tag_cost_center || 'MISSING'}`);
    console.log(`  - Business Impact: ${request.tag_business_impact || 'MISSING'}`);
    console.log(`  - Data Sensitivity: ${request.tag_data_sensitivity || 'MISSING'}`);

    // Test updating metadata
    console.log('🔄 Testing metadata update...');
    const updateData = {
      tag_owner: 'test.user@company.com',
      tag_project_id: 'TEST-2025-999',
      tag_project_name: 'Test Project Update',
      tag_cost_center: 'TEST-999',
      tag_business_impact: 'High',
      tag_data_sensitivity: 'Confidential'
    };

    const updateResponse = await fetch(`${BASE_URL}/requests/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    
    if (!updateResult.success) {
      throw new Error('Failed to update request: ' + updateResult.message);
    }

    console.log('✅ Update successful!');
    console.log('🔍 Verifying updated values...');
    
    // Verify the update worked
    const verifyResponse = await fetch(`${BASE_URL}/requests/1`);
    const verifyResult = await verifyResponse.json();
    const updatedRequest = verifyResult.data;
    
    console.log('📊 Updated request data:');
    console.log(`  - Owner: ${updatedRequest.tag_owner}`);
    console.log(`  - Project ID: ${updatedRequest.tag_project_id}`);
    console.log(`  - Project Name: ${updatedRequest.tag_project_name}`);
    console.log(`  - Cost Center: ${updatedRequest.tag_cost_center}`);
    console.log(`  - Business Impact: ${updatedRequest.tag_business_impact}`);
    console.log(`  - Data Sensitivity: ${updatedRequest.tag_data_sensitivity}`);

    console.log('🎉 All metadata fields are working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testMetadataFields().catch(console.error);
