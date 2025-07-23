import React, { useState } from 'react';
import { requestService } from '../services/apiService';
import './createRequest.css';

interface RequesterInfo {
  name: string;
  email: string;
  department: string;
}

interface Tags {
  Owner: string;
  CostCenter: string;
  ProjectName: string;
  ProjectID: string;
  businessImpact: 'High' | 'Medium' | 'Low';
  dataSensitivity: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
}

interface ManagedIdentity {
  name: string;
  role: 'Reader' | 'Contributor' | 'CustomRole';
}

interface RequestFormData {
  requester: RequesterInfo;
  manager?: RequesterInfo;
  approver?: RequesterInfo;
  subscriptionName: string;
  businessUnit: string;
  applicationGroup: string;
  networkName: string;
  networkCIDR: string;
  notes: string;
  monthlyBudgetEstimate: number;
  environment: 'prd' | 'dev' | 'tst' | 'qua' | 'stg' | 'ppd';
  region: string;
  tags: Tags;
  productLine: 'corpConnected' | 'online' | 'techPlatform' | 'sharedApplicationPortfolio' | 'sandbox';
  rbacGroup?: {
    groupName: string;
    role: 'Owner' | 'Contributor' | 'Reader' | 'CustomRole';
  };
  managedIdentities?: ManagedIdentity[];
  hybridConnectivity?: boolean;
  networking?: {
    requireHubPeering: boolean;
    vnetName?: string;
    addressSpace?: string;
  };
  policyAssignment?: {
    policyName: string;
    policyType: 'Policy' | 'Initiative';
    assignImmediately: boolean;
  };
}

const CreateRequest: React.FC = () => {
  const [formData, setFormData] = useState<RequestFormData>({
    requester: { name: '', email: '', department: '' },
    manager: { name: '', email: '', department: '' },
    approver: { name: '', email: '', department: '' },
    subscriptionName: '',
    businessUnit: '',
    applicationGroup: '',
    networkName: '',
    networkCIDR: '',
    notes: '',
    monthlyBudgetEstimate: 1000,
    environment: 'dev',
    region: 'East US',
    tags: {
      Owner: '',
      CostCenter: '',
      ProjectName: '',
      ProjectID: '',
      businessImpact: 'Medium',
      dataSensitivity: 'Internal'
    },
    productLine: 'sandbox',
    hybridConnectivity: false,
    networking: {
      requireHubPeering: false
    },
    policyAssignment: {
      policyName: '',
      policyType: 'Policy',
      assignImmediately: true
    }
  });

  const [managedIdentities, setManagedIdentities] = useState<ManagedIdentity[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    section?: keyof RequestFormData,
    field?: string
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (section && field) {
      setFormData(prev => {
        const currentSection = prev[section as keyof RequestFormData] as Record<string, unknown>;
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
  };

  const addManagedIdentity = () => {
    setManagedIdentities(prev => [...prev, { name: '', role: 'Reader' }]);
  };

  const removeManagedIdentity = (index: number) => {
    setManagedIdentities(prev => prev.filter((_, i) => i !== index));
  };

  const updateManagedIdentity = (index: number, field: keyof ManagedIdentity, value: string) => {
    setManagedIdentities(prev => prev.map((mi, i) => 
      i === index ? { ...mi, [field]: value } : mi
    ));
  };

  const validateForm = (): boolean => {
    const required = [
      'subscriptionName', 'businessUnit'
    ];
    
    for (const field of required) {
      if (!formData[field as keyof RequestFormData]) {
        setMessage({ type: 'error', text: `${field} is required` });
        return false;
      }
    }

    if (!formData.requester.name || !formData.requester.email || !formData.requester.department) {
      setMessage({ type: 'error', text: 'All requester fields are required' });
      return false;
    }

    if (!formData.tags.Owner || !formData.tags.CostCenter || !formData.tags.ProjectName || !formData.tags.ProjectID) {
      setMessage({ type: 'error', text: 'All required tag fields must be filled' });
      return false;
    }

    // Validate subscription name pattern
    const namePattern = /^[a-zA-Z0-9-_]{3,50}$/;
    if (!namePattern.test(formData.subscriptionName)) {
      setMessage({ type: 'error', text: 'Subscription name must be 3-50 characters and contain only letters, numbers, hyphens, and underscores' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const submitData = {
        ...formData,
        managedIdentities: managedIdentities.length > 0 ? managedIdentities : undefined
      };

      // Replace with your API endpoint
      const result = await requestService.submitRequest(submitData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Request submitted successfully!' });
        // Reset form or redirect as needed
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-request-container">
      <div className="create-request-form">
        <h1>Azure Subscription Request</h1>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Requester Information */}
          <section className="form-section">
            <h2>Requester Information</h2>
            <div className="form-group">
              <label htmlFor="requester-name">Name *</label>
              <input
                type="text"
                id="requester-name"
                value={formData.requester.name}
                onChange={(e) => handleInputChange(e, 'requester', 'name')}
                required
              />
              <div className="form-hint">
                Enter your full name as it appears in your organization's directory.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="requester-email">Email *</label>
              <input
                type="email"
                id="requester-email"
                value={formData.requester.email}
                onChange={(e) => handleInputChange(e, 'requester', 'email')}
                required
              />
              <div className="form-hint">
                Provide your corporate email address for notifications and communications.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="requester-department">Department *</label>
              <input
                type="text"
                id="requester-department"
                value={formData.requester.department}
                onChange={(e) => handleInputChange(e, 'requester', 'department')}
                required
              />
              <div className="form-hint">
                Specify your department or organizational unit (e.g., IT, Finance, Marketing).
              </div>
            </div>
          </section>

          {/* Manager Information */}
          <section className="form-section">
            <h2>Manager Information</h2>
            <div className="form-group">
              <label htmlFor="manager-name">Manager Name</label>
              <input
                type="text"
                id="manager-name"
                value={formData.manager?.name || ''}
                onChange={(e) => handleInputChange(e, 'manager', 'name')}
              />
              <div className="form-hint">
                Enter your direct manager's full name for approval workflow.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="manager-email">Manager Email</label>
              <input
                type="email"
                id="manager-email"
                value={formData.manager?.email || ''}
                onChange={(e) => handleInputChange(e, 'manager', 'email')}
              />
              <div className="form-hint">
                Provide your manager's corporate email address for approval notifications.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="manager-department">Manager Department</label>
              <input
                type="text"
                id="manager-department"
                value={formData.manager?.department || ''}
                onChange={(e) => handleInputChange(e, 'manager', 'department')}
              />
              <div className="form-hint">
                Specify your manager's department or organizational unit.
              </div>
            </div>
          </section>

          {/* Approver Information */}
          <section className="form-section">
            <h2>Approver Information</h2>
            <div className="form-group">
              <label htmlFor="approver-name">Approver Name</label>
              <input
                type="text"
                id="approver-name"
                value={formData.approver?.name || ''}
                onChange={(e) => handleInputChange(e, 'approver', 'name')}
              />
              <div className="form-hint">
                Enter the final approver's name (e.g., department head, IT director).
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="approver-email">Approver Email</label>
              <input
                type="email"
                id="approver-email"
                value={formData.approver?.email || ''}
                onChange={(e) => handleInputChange(e, 'approver', 'email')}
              />
              <div className="form-hint">
                Provide the approver's corporate email address for final authorization.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="approver-department">Approver Department</label>
              <input
                type="text"
                id="approver-department"
                value={formData.approver?.department || ''}
                onChange={(e) => handleInputChange(e, 'approver', 'department')}
              />
              <div className="form-hint">
                Specify the approver's department or organizational unit.
              </div>
            </div>
          </section>

          {/* Subscription Details */}
          <section className="form-section">
            <h2>Subscription Details</h2>
            <div className="form-group">
              <label htmlFor="subscriptionName">Subscription Name *</label>
              <input
                type="text"
                id="subscriptionName"
                name="subscriptionName"
                value={formData.subscriptionName}
                onChange={handleInputChange}
                pattern="^[a-zA-Z0-9-_]{3,50}$"
                title="3-50 characters, letters, numbers, hyphens, and underscores only"
                placeholder="e.g. MyApp-Production, DataLake-Dev, WebPortal-Staging"
                required
              />
              <div className="form-hint">
                Must be unique within your Azure tenant. Use a descriptive name that includes environment and purpose.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="businessUnit">Business Unit *</label>
              <input
                type="text"
                id="businessUnit"
                name="businessUnit"
                value={formData.businessUnit}
                onChange={handleInputChange}
                placeholder="e.g. IT Operations, Finance, Marketing, R&D"
                required
              />
              <div className="form-hint">
                Your organizational business unit or department responsible for this subscription.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="applicationGroup">Application Group</label>
              <input
                type="text"
                id="applicationGroup"
                name="applicationGroup"
                value={formData.applicationGroup}
                onChange={handleInputChange}
                placeholder="e.g. Web Applications, Data Analytics, Mobile Apps"
              />
              <div className="form-hint">
                The application group or category this subscription supports.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="networkName">Network Name</label>
              <input
                type="text"
                id="networkName"
                name="networkName"
                value={formData.networkName}
                onChange={handleInputChange}
                placeholder="e.g. corp-network, dmz-network, isolated-network"
              />
              <div className="form-hint">
                Name of the network this subscription will be connected to.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="networkCIDR">Network CIDR</label>
              <input
                type="text"
                id="networkCIDR"
                name="networkCIDR"
                value={formData.networkCIDR}
                onChange={handleInputChange}
                placeholder="e.g. 10.0.0.0/16, 172.16.0.0/12, 192.168.0.0/16"
                pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$"
                title="Enter a valid CIDR notation (e.g., 10.0.0.0/16)"
              />
              <div className="form-hint">
                Specify the IP address range in CIDR notation for the network (e.g., 10.0.0.0/16).
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="monthlyBudgetEstimate">Monthly Budget Estimate (USD)</label>
              <input
                type="number"
                id="monthlyBudgetEstimate"
                name="monthlyBudgetEstimate"
                value={formData.monthlyBudgetEstimate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
              <div className="form-hint">
                Estimated monthly Azure spending for this subscription in USD.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="environment">Environment</label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleInputChange}
              >
                <option value="dev">dev</option>
                <option value="tst">tst</option>
                <option value="qua">qua</option>
                <option value="stg">stg</option>
                <option value="ppd">ppd</option>
                <option value="prd">prd</option>
              </select>
              <div className="form-hint">
                Select the environment type that best describes this subscription's purpose.
              </div>
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
              <small className="form-hint">
                Specify the Azure region where core services will be deployed. This affects data residency and latency.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="productLine">Product Line</label>
              <select
                id="productLine"
                name="productLine"
                value={formData.productLine}
                onChange={handleInputChange}
              >
                <option value="sandbox">Sandbox</option>
                <option value="corpConnected">Corp Connected</option>
                <option value="online">Online</option>
                <option value="techPlatform">Tech Platform</option>
                <option value="sharedApplicationPortfolio">Shared Application Portfolio</option>
              </select>
              <div className="form-hint">
                Choose the product line that best categorizes your subscription's intended use.
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="form-section">
            <h2>Tags</h2>
            <div className="form-group">
              <label htmlFor="tag-owner">Owner *</label>
              <input
                type="text"
                id="tag-owner"
                value={formData.tags.Owner}
                onChange={(e) => handleInputChange(e, 'tags', 'Owner')}
                required
              />
              <div className="form-hint">
                Product or workload / application / project owner.
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tag-cost-center">Cost Center *</label>
              <input
                type="text"
                id="tag-cost-center"
                value={formData.tags.CostCenter}
                onChange={(e) => handleInputChange(e, 'tags', 'CostCenter')}
                placeholder="e.g. CC-12345, DEPT-IT-001, 100234567"
                required
              />
              <small className="form-hint">
                Enter the cost center code for billing and financial tracking. Contact your finance team if unsure.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="tag-project-name">Project Name *</label>
              <input
                type="text"
                id="tag-project-name"
                value={formData.tags.ProjectName}
                onChange={(e) => handleInputChange(e, 'tags', 'ProjectName')}
                placeholder="e.g. Customer Portal Modernization, Data Analytics Platform"
                required
              />
              <small className="form-hint">
                Provide a descriptive name for your project or initiative. This helps with resource organization and reporting.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="tag-project-id">Project ID *</label>
              <input
                type="text"
                id="tag-project-id"
                value={formData.tags.ProjectID}
                onChange={(e) => handleInputChange(e, 'tags', 'ProjectID')}
                required
              />
              <div className="form-hint">
                Unique identifier for your project (e.g. PRJ-001, WEBAPP-2025, DATA-ANALYTICS-01).
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tag-business-impact">Business Impact</label>
              <select
                id="tag-business-impact"
                value={formData.tags.businessImpact}
                onChange={(e) => handleInputChange(e, 'tags', 'businessImpact')}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <div className="form-hint">
                Select the business impact level: High (critical operations), Medium (important functions), Low (non-critical).
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tag-data-sensitivity">Data Sensitivity</label>
              <select
                id="tag-data-sensitivity"
                value={formData.tags.dataSensitivity}
                onChange={(e) => handleInputChange(e, 'tags', 'dataSensitivity')}
              >
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
              </select>
              <div className="form-hint">
                Choose data classification: Public (no restrictions), Internal (company only), Confidential (limited access), Restricted (highly sensitive).
              </div>
            </div>
          </section>

          {/* Optional Sections */}
          <section className="form-section">
            <h2>Optional Configuration</h2>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hybridConnectivity"
                  checked={formData.hybridConnectivity || false}
                  onChange={handleInputChange}
                />
                Hybrid Connectivity Required
              </label>
            </div>

            {/* Managed Identities */}
            <div className="subsection">
              <h3>Managed Identities</h3>
              <div className="form-hint">
                Managed identities that will be used for automated Infrastructure as Code (IaC) deployments. These provide secure authentication for deployment pipelines and automation tools to access Azure resources.
              </div>
              {managedIdentities.map((mi, index) => (
                <div key={index} className="managed-identity-row">
                  <input
                    type="text"
                    placeholder="Identity Name"
                    value={mi.name}
                    onChange={(e) => updateManagedIdentity(index, 'name', e.target.value)}
                  />
                  <select
                    value={mi.role}
                    onChange={(e) => updateManagedIdentity(index, 'role', e.target.value as ManagedIdentity['role'])}
                    aria-label={`Role for managed identity ${index + 1}`}
                  >
                    <option value="Reader">Reader</option>
                    <option value="Contributor">Contributor</option>
                    <option value="CustomRole">Custom Role</option>
                  </select>
                  <button type="button" onClick={() => removeManagedIdentity(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addManagedIdentity}>Add Managed Identity</button>
            </div>
          </section>

          {/* Notes Section */}
          <section className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any additional information, special requirements, or comments..."
              />
              <div className="form-hint">
                Provide any additional context, special requirements, or comments for this subscription request.
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
