// Test script to check API endpoints
console.log('🔍 Testing API endpoints for metadata fields...');

async function testAPIs() {
  const APIs = [
    { name: 'Full API (port 3001)', url: 'http://localhost:3001/api' },
    { name: 'Quick Start API (port 3001)', url: 'http://localhost:3001/api' }
  ];

  for (const api of APIs) {
    try {
      console.log(`\n📡 Testing ${api.name}...`);
      
      // Test health endpoint
      const healthResponse = await fetch(`${api.url}/health`);
      if (!healthResponse.ok) {
        console.log(`❌ ${api.name} is not running`);
        continue;
      }
      
      const health = await healthResponse.json();
      console.log(`✅ ${api.name} is running (mode: ${health.mode || 'unknown'})`);
      
      // Test get request ID 1
      const requestResponse = await fetch(`${api.url}/requests/1`);
      if (!requestResponse.ok) {
        console.log(`❌ Failed to get request from ${api.name}`);
        continue;
      }
      
      const requestResult = await requestResponse.json();
      if (!requestResult.success) {
        console.log(`❌ Request failed: ${requestResult.message}`);
        continue;
      }
      
      const request = requestResult.data;
      console.log(`📊 Request data from ${api.name}:`);
      console.log(`  - Owner: ${request.tag_owner || 'MISSING'}`);
      console.log(`  - Project ID: ${request.tag_project_id || 'MISSING'}`);
      console.log(`  - Project Name: ${request.tag_project_name || 'MISSING'}`);
      console.log(`  - Cost Center: ${request.tag_cost_center || 'MISSING'}`);
      console.log(`  - Business Impact: ${request.tag_business_impact || 'MISSING'}`);
      console.log(`  - Data Sensitivity: ${request.tag_data_sensitivity || 'MISSING'}`);
      console.log(`  - Mode: ${requestResult.mode || 'unknown'}`);
      
    } catch (error) {
      console.log(`❌ Error testing ${api.name}: ${error.message}`);
    }
  }
}

testAPIs().catch(console.error);
