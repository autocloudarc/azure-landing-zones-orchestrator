import React, { useState } from 'react';

// Simple test component to verify metadata display
const MetadataTest: React.FC = () => {
  const [testData] = useState({
    tagOwner: 'john.doe@company.com',
    tagProjectId: 'PROJ-2025-001',
    tagProjectName: 'Azure Migration Project',
    tagCostCenter: 'IT-001',
    tagBusinessImpact: 'Medium' as const,
    tagDataSensitivity: 'Internal' as const
  });

  return (
    <div style={{ padding: '20px', background: 'white', margin: '20px', borderRadius: '8px' }}>
      <h2>Metadata Test Component</h2>
      <p>This component tests if metadata fields render correctly with hardcoded data.</p>
      
      <div style={{ display: 'grid', gap: '10px' }}>
        <div>
          <label>Owner:</label>
          <input type="text" value={testData.tagOwner} readOnly style={{ marginLeft: '10px', padding: '5px' }} />
        </div>
        
        <div>
          <label>Project ID:</label>
          <input type="text" value={testData.tagProjectId} readOnly style={{ marginLeft: '10px', padding: '5px' }} />
        </div>
        
        <div>
          <label>Project Name:</label>
          <input type="text" value={testData.tagProjectName} readOnly style={{ marginLeft: '10px', padding: '5px' }} />
        </div>
        
        <div>
          <label>Cost Center:</label>
          <input type="text" value={testData.tagCostCenter} readOnly style={{ marginLeft: '10px', padding: '5px' }} />
        </div>
        
        <div>
          <label>Business Impact:</label>
          <select value={testData.tagBusinessImpact} style={{ marginLeft: '10px', padding: '5px' }}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        
        <div>
          <label>Data Sensitivity:</label>
          <select value={testData.tagDataSensitivity} style={{ marginLeft: '10px', padding: '5px' }}>
            <option value="Public">Public</option>
            <option value="Internal">Internal</option>
            <option value="Confidential">Confidential</option>
            <option value="Restricted">Restricted</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MetadataTest;
