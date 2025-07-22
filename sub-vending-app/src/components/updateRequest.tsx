import React, { useState, useEffect } from 'react';
import { requestService } from '../services/apiService';
import './updateRequest.css';

interface RequesterInfo {
  name: string;
  email: string;
  department: string;
}

interface RequestFormData {
  id?: number;
  requester: RequesterInfo;
  subscriptionName: string;
  businessUnit: string;
  monthlyBudgetEstimate: number;
  environment: 'prd' | 'dev' | 'tst' | 'qua' | 'stg' | 'ppd';
  region: string;
  requestReason: string;
  notes: string;
  // Metadata fields
  tagOwner: string;
  tagProjectId: string;
  tagProjectName: string;
  tagCostCenter: string;
  tagBusinessImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  tagDataSensitivity: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
}

interface UpdateRequestProps {
  requestId?: number;
}

const UpdateRequest: React.FC<UpdateRequestProps> = ({ 
  requestId: propRequestId 
}) => {
  const [requestId, setRequestId] = useState(propRequestId?.toString() || '');
  const [formData, setFormData] = useState<RequestFormData>({
    requester: {
      name: '',
      email: '',
      department: ''
    },
    subscriptionName: '',
    businessUnit: '',
    monthlyBudgetEstimate: 0,
    environment: 'dev',
    region: '',
    requestReason: '',
    notes: '',
    // Metadata fields
    tagOwner: '',
    tagProjectId: '',
    tagProjectName: '',
    tagCostCenter: '',
    tagBusinessImpact: 'Medium',
    tagDataSensitivity: 'Internal'
  });

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [requestFound, setRequestFound] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Test API connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }
      } catch {
        setApiConnected(false);
      }
    };
    
    testApiConnection();
  }, []);

  const handleSearchRequest = async () => {
    if (!requestId.trim()) {
      setMessage('Please enter a request ID to search');
      setMessageType('error');
      return;
    }

    setSearching(true);
    setMessage('');

    try {
      const response = await requestService.getRequest(parseInt(requestId));
      
      if (response.success && response.data) {
        // Populate form with the retrieved data
        const data = response.data as Record<string, unknown>; // Type assertion for database record
        
        console.log('📊 Raw database data:', data);
        console.log('🏷️ Metadata values:', {
          tag_owner: data.tag_owner,
          tag_project_id: data.tag_project_id,
          tag_project_name: data.tag_project_name,
          tag_cost_center: data.tag_cost_center,
          tag_business_impact: data.tag_business_impact,
          tag_data_sensitivity: data.tag_data_sensitivity
        });
        
        setFormData({
          id: Number(data.id) || 0,
          requester: {
            name: String(data.requester_name || ''),
            email: String(data.requester_email || ''),
            department: String(data.requester_department || '')
          },
          subscriptionName: String(data.subscription_name || ''),
          businessUnit: String(data.business_unit || ''),
          monthlyBudgetEstimate: Number(data.monthly_budget_estimate) || 0,
          environment: (data.environment as 'prd' | 'dev' | 'tst' | 'qua' | 'stg' | 'ppd') || 'dev',
          region: String(data.region || ''),
          requestReason: String(data.request_reason || ''),
          notes: String(data.notes || ''),
          // Metadata fields
          tagOwner: String(data.tag_owner || ''),
          tagProjectId: String(data.tag_project_id || ''),
          tagProjectName: String(data.tag_project_name || ''),
          tagCostCenter: String(data.tag_cost_center || ''),
          tagBusinessImpact: (data.tag_business_impact as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
          tagDataSensitivity: (data.tag_data_sensitivity as 'Public' | 'Internal' | 'Confidential' | 'Restricted') || 'Internal'
        });
        
        console.log('✅ Form data set with metadata:', {
          tagOwner: String(data.tag_owner || ''),
          tagProjectId: String(data.tag_project_id || ''),
          tagProjectName: String(data.tag_project_name || ''),
          tagCostCenter: String(data.tag_cost_center || ''),
          tagBusinessImpact: (data.tag_business_impact as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
          tagDataSensitivity: (data.tag_data_sensitivity as 'Public' | 'Internal' | 'Confidential' | 'Restricted') || 'Internal'
        });
        
        setRequestFound(true);
        setMessage(`Request ${requestId} loaded successfully`);
        setMessageType('success');
      } else {
        setMessage(response.error || `Request ${requestId} not found`);
        setMessageType('error');
        setRequestFound(false);
      }
    } catch (error) {
      setMessage(`Error loading request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessageType('error');
      setRequestFound(false);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested object properties (e.g., "requester.name")
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RequestFormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'monthlyBudgetEstimate' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleUpdateRequest = async () => {
    if (!formData.id) {
      setMessage('No request loaded to update');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Convert form data to API format
      const updateData = {
        id: formData.id,
        requester_name: formData.requester.name,
        requester_email: formData.requester.email,
        requester_department: formData.requester.department,
        subscription_name: formData.subscriptionName,
        business_unit: formData.businessUnit,
        monthly_budget_estimate: formData.monthlyBudgetEstimate,
        environment: formData.environment,
        region: formData.region,
        request_reason: formData.requestReason,
        notes: formData.notes,
        // Metadata fields
        tag_owner: formData.tagOwner,
        tag_project_id: formData.tagProjectId,
        tag_project_name: formData.tagProjectName,
        tag_cost_center: formData.tagCostCenter,
        tag_business_impact: formData.tagBusinessImpact,
        tag_data_sensitivity: formData.tagDataSensitivity
      };

      const response = await requestService.updateRequest(formData.id, updateData as Record<string, unknown>);
      
      if (response.success) {
        setMessage(`Request ${formData.id} updated successfully`);
        setMessageType('success');
      } else {
        setMessage(response.error || 'Failed to update request');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error updating request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRequestId('');
    setFormData({
      requester: {
        name: '',
        email: '',
        department: ''
      },
      subscriptionName: '',
      businessUnit: '',
      monthlyBudgetEstimate: 0,
      environment: 'dev',
      region: '',
      requestReason: '',
      notes: '',
      // Metadata fields
      tagOwner: '',
      tagProjectId: '',
      tagProjectName: '',
      tagCostCenter: '',
      tagBusinessImpact: 'Medium',
      tagDataSensitivity: 'Internal'
    });
    setRequestFound(false);
    setMessage('');
  };

  return (
    <div className="update-request-container">
      <h1>Update Subscription Request</h1>
      
      {/* API Connection Status */}
      {apiConnected === false && (
        <div className="message error">
          ⚠️ Cannot connect to API server. Please ensure the server is running on port 3001.
        </div>
      )}
      
      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      
      {/* Search Section */}
      <section className="search-section">
        <h2>Find Request</h2>
        <div className="search-form">
          <div className="form-group">
            <label htmlFor="requestId">Request ID *</label>
            <input
              type="number"
              id="requestId"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="Enter request ID (e.g. 123)"
              disabled={searching || apiConnected === false}
            />
            <div className="form-hint">
              Enter the ID of the request you want to update
            </div>
          </div>
          <div className="search-controls">
            <button 
              type="button" 
              onClick={handleSearchRequest}
              disabled={searching || !requestId.trim() || apiConnected === false}
              className="search-btn"
            >
              {searching ? 'Searching...' : 'Search Request'}
            </button>
            <button 
              type="button" 
              onClick={handleReset}
              className="reset-btn"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Update Form Section - Only show when request is found */}
      {requestFound && (
        <section className="search-section">
          <h2>Update Request Details</h2>
          <form className="update-form">
            {/* Basic Information */}
            <div className="form-group">
              <label htmlFor="subscriptionName">Subscription Name *</label>
              <input
                type="text"
                id="subscriptionName"
                name="subscriptionName"
                value={formData.subscriptionName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="businessUnit">Business Unit *</label>
              <input
                type="text"
                id="businessUnit"
                name="businessUnit"
                value={formData.businessUnit}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="environment">Environment *</label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleInputChange}
                required
              >
                <option value="dev">Development</option>
                <option value="tst">Test</option>
                <option value="qua">Quality Assurance</option>
                <option value="stg">Staging</option>
                <option value="ppd">Pre-Production</option>
                <option value="prd">Production</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="region">Region *</label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="e.g. East US, West Europe, Southeast Asia"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="monthlyBudgetEstimate">Monthly Budget Estimate *</label>
              <input
                type="number"
                id="monthlyBudgetEstimate"
                name="monthlyBudgetEstimate"
                value={formData.monthlyBudgetEstimate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Requester Information */}
            <h3>Requester Information</h3>
            <div className="form-group">
              <label htmlFor="requester.name">Requester Name *</label>
              <input
                type="text"
                id="requester.name"
                name="requester.name"
                value={formData.requester.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="requester.email">Requester Email *</label>
              <input
                type="email"
                id="requester.email"
                name="requester.email"
                value={formData.requester.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="requester.department">Department *</label>
              <input
                type="text"
                id="requester.department"
                name="requester.department"
                value={formData.requester.department}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Additional Information */}
            <div className="form-group">
              <label htmlFor="requestReason">Request Reason</label>
              <textarea
                id="requestReason"
                name="requestReason"
                value={formData.requestReason}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the reason for this subscription request"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes or comments"
              />
            </div>

            {/* Tags & Metadata */}
            <h3>Tags & Metadata</h3>
            <div className="form-group">
              <label htmlFor="tagOwner">Owner *</label>
              <input
                type="email"
                id="tagOwner"
                name="tagOwner"
                value={formData.tagOwner}
                onChange={handleInputChange}
                placeholder="Resource owner email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tagProjectId">Project ID *</label>
              <input
                type="text"
                id="tagProjectId"
                name="tagProjectId"
                value={formData.tagProjectId}
                onChange={handleInputChange}
                placeholder="e.g. PROJ-2025-001"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tagProjectName">Project Name *</label>
              <input
                type="text"
                id="tagProjectName"
                name="tagProjectName"
                value={formData.tagProjectName}
                onChange={handleInputChange}
                placeholder="e.g. Azure Migration Project"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tagCostCenter">Cost Center *</label>
              <input
                type="text"
                id="tagCostCenter"
                name="tagCostCenter"
                value={formData.tagCostCenter}
                onChange={handleInputChange}
                placeholder="e.g. IT-001, MKT-500"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tagBusinessImpact">Business Impact *</label>
              <select
                id="tagBusinessImpact"
                name="tagBusinessImpact"
                value={formData.tagBusinessImpact}
                onChange={handleInputChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="tagDataSensitivity">Data Sensitivity *</label>
              <select
                id="tagDataSensitivity"
                name="tagDataSensitivity"
                value={formData.tagDataSensitivity}
                onChange={handleInputChange}
                required
              >
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="search-controls">
              <button 
                type="button" 
                onClick={handleUpdateRequest}
                disabled={loading || !formData.id}
                className="search-btn"
              >
                {loading ? 'Updating...' : 'Update Request'}
              </button>
              <button 
                type="button" 
                onClick={handleReset}
                className="reset-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Debug Panel */}
      <section className="debug-info">
        <h3>Debug Information</h3>
        <p>API Connected: {apiConnected === null ? 'Testing...' : apiConnected ? 'Yes' : 'No'}</p>
        <p>Request ID: {requestId || 'None'}</p>
        <p>Searching: {searching ? 'Yes' : 'No'}</p>
        <p>Request Found: {requestFound ? 'Yes' : 'No'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
      </section>
    </div>
  );
};

export default UpdateRequest;
