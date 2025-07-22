import React, { useState, useEffect } from 'react';
import { requestService } from '../services/apiService';
import './ViewRequests.css';

interface Request {
  id: number;
  requester_name: string;
  requester_email: string;
  requester_department: string;
  manager_name?: string;
  manager_email?: string;
  manager_department?: string;
  approver_name?: string;
  approver_email?: string;
  approver_department?: string;
  subscription_name: string;
  business_unit: string;
  monthly_budget_estimate: number;
  environment: string;
  region: string;
  product_line: string;
  rbac_group_name?: string;
  rbac_group_role?: string;
  hybrid_connectivity: boolean;
  tag_owner: string;
  tag_cost_center: string;
  tag_environment: string;
  tag_project_name: string;
  tag_project_id: string;
  tag_business_impact: string;
  tag_data_sensitivity: string;
  networking_require_hub_peering?: boolean;
  networking_vnet_name?: string;
  networking_address_space?: string;
  policy_assignment_name?: string;
  policy_assignment_type?: string;
  policy_assign_immediately?: boolean;
  managed_identities?: string;
  status: string;
  created_date: string;
  [key: string]: string | number | boolean | undefined;
}

interface Request {
  id: number;
  subscription_name: string;
  business_unit: string;
  environment: string;
  product_line: string;
  status: string;
  created_date: string;
  requester_name: string;
  requester_email: string;
  monthly_budget_estimate: number;
}

const ViewRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests();
      
      if (response.success) {
        setRequests((response.data || []) as Request[]);
      } else {
        setError('Failed to load requests');
      }
    } catch (err) {
      setError('Error loading requests: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="view-requests-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-requests-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadRequests} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-requests-container">
      <div className="requests-header">
        <h1>Subscription Requests</h1>
        <button onClick={loadRequests} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests found</h3>
          <p>There are no subscription requests in the system yet.</p>
        </div>
      ) : (
        <div className="requests-content">
          <div className="requests-summary">
            <div className="summary-card">
              <h3>Total Requests</h3>
              <span className="summary-number">{requests.length}</span>
            </div>
            <div className="summary-card">
              <h3>Pending</h3>
              <span className="summary-number">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div className="summary-card">
              <h3>Approved</h3>
              <span className="summary-number">
                {requests.filter(r => r.status === 'approved').length}
              </span>
            </div>
          </div>

          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subscription Name</th>
                  <th>Requester</th>
                  <th>Business Unit</th>
                  <th>Environment</th>
                  <th>Region</th>
                  <th>Product Line</th>
                  <th>Budget</th>
                  <th>Project Name</th>
                  <th>Cost Center</th>
                  <th>Hybrid</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} onClick={() => {
                    console.log('🔍 Selected request metadata:', {
                      tag_owner: request.tag_owner,
                      tag_project_id: request.tag_project_id,
                      tag_project_name: request.tag_project_name,
                      tag_cost_center: request.tag_cost_center,
                      tag_business_impact: request.tag_business_impact,
                      tag_data_sensitivity: request.tag_data_sensitivity
                    });
                    console.log('📋 Full request object:', request);
                    setSelectedRequest(request);
                  }}>
                    <td>#{request.id}</td>
                    <td className="subscription-name" title={request.subscription_name}>
                      {request.subscription_name}
                    </td>
                    <td title={`${request.requester_name} (${request.requester_email})`}>
                      <div className="requester-info">
                        <span className="name">{request.requester_name}</span>
                        <span className="dept">{request.requester_department}</span>
                      </div>
                    </td>
                    <td>{request.business_unit}</td>
                    <td>
                      <span className={`env-badge ${request.environment}`}>
                        {request.environment?.toUpperCase()}
                      </span>
                    </td>
                    <td>{request.region}</td>
                    <td>{request.product_line}</td>
                    <td>${request.monthly_budget_estimate?.toLocaleString()}</td>
                    <td title={request.tag_project_name}>
                      {request.tag_project_name}
                    </td>
                    <td>{request.tag_cost_center}</td>
                    <td>
                      {request.hybrid_connectivity ? (
                        <span className="hybrid-yes">✓</span>
                      ) : (
                        <span className="hybrid-no">✗</span>
                      )}
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{formatDate(request.created_date)}</td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                        }}
                        className="view-btn"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (() => {
        console.log('🎯 Modal rendering with selectedRequest:', selectedRequest);
        console.log('🏷️ Modal metadata values:', {
          tag_owner: selectedRequest.tag_owner,
          tag_project_id: selectedRequest.tag_project_id,
          tag_business_impact: selectedRequest.tag_business_impact,
          tag_data_sensitivity: selectedRequest.tag_data_sensitivity
        });
        return (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details - #{selectedRequest.id}</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Subscription Name:</label>
                    <span>{selectedRequest.subscription_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Business Unit:</label>
                    <span>{selectedRequest.business_unit}</span>
                  </div>
                  <div className="detail-item">
                    <label>Environment:</label>
                    <span className={`env-badge ${selectedRequest.environment}`}>
                      {selectedRequest.environment?.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Region:</label>
                    <span>{selectedRequest.region}</span>
                  </div>
                  <div className="detail-item">
                    <label>Product Line:</label>
                    <span>{selectedRequest.product_line}</span>
                  </div>
                  <div className="detail-item">
                    <label>Monthly Budget:</label>
                    <span>${selectedRequest.monthly_budget_estimate?.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hybrid Connectivity:</label>
                    <span>{selectedRequest.hybrid_connectivity ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span>{getStatusBadge(selectedRequest.status)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedRequest.created_date)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Requester:</label>
                    <span>{selectedRequest.requester_name} ({selectedRequest.requester_email})</span>
                  </div>
                  <div className="detail-item">
                    <label>Requester Department:</label>
                    <span>{selectedRequest.requester_department}</span>
                  </div>
                  {selectedRequest.manager_name && (
                    <>
                      <div className="detail-item">
                        <label>Manager:</label>
                        <span>{selectedRequest.manager_name} ({selectedRequest.manager_email})</span>
                      </div>
                      <div className="detail-item">
                        <label>Manager Department:</label>
                        <span>{selectedRequest.manager_department}</span>
                      </div>
                    </>
                  )}
                  {selectedRequest.approver_name && (
                    <>
                      <div className="detail-item">
                        <label>Approver:</label>
                        <span>{selectedRequest.approver_name} ({selectedRequest.approver_email})</span>
                      </div>
                      <div className="detail-item">
                        <label>Approver Department:</label>
                        <span>{selectedRequest.approver_department}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Tags & Metadata</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Owner:</label>
                    <span>{selectedRequest.tag_owner}</span>
                  </div>
                  <div className="detail-item">
                    <label>Cost Center:</label>
                    <span>{selectedRequest.tag_cost_center}</span>
                  </div>
                  <div className="detail-item">
                    <label>Project Name:</label>
                    <span>{selectedRequest.tag_project_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Project ID:</label>
                    <span>{selectedRequest.tag_project_id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Business Impact:</label>
                    <span>{selectedRequest.tag_business_impact}</span>
                  </div>
                  <div className="detail-item">
                    <label>Data Sensitivity:</label>
                    <span>{selectedRequest.tag_data_sensitivity}</span>
                  </div>
                </div>
              </div>

              {(selectedRequest.rbac_group_name || selectedRequest.networking_vnet_name || selectedRequest.policy_assignment_name) && (
                <div className="detail-section">
                  <h3>Advanced Configuration</h3>
                  <div className="detail-grid">
                    {selectedRequest.rbac_group_name && (
                      <>
                        <div className="detail-item">
                          <label>RBAC Group:</label>
                          <span>{selectedRequest.rbac_group_name}</span>
                        </div>
                        <div className="detail-item">
                          <label>RBAC Role:</label>
                          <span>{selectedRequest.rbac_group_role}</span>
                        </div>
                      </>
                    )}
                    {selectedRequest.networking_vnet_name && (
                      <>
                        <div className="detail-item">
                          <label>VNet Name:</label>
                          <span>{selectedRequest.networking_vnet_name}</span>
                        </div>
                        <div className="detail-item">
                          <label>Address Space:</label>
                          <span>{selectedRequest.networking_address_space}</span>
                        </div>
                        <div className="detail-item">
                          <label>Hub Peering:</label>
                          <span>{selectedRequest.networking_require_hub_peering ? 'Required' : 'Not Required'}</span>
                        </div>
                      </>
                    )}
                    {selectedRequest.policy_assignment_name && (
                      <>
                        <div className="detail-item">
                          <label>Policy Assignment:</label>
                          <span>{selectedRequest.policy_assignment_name}</span>
                        </div>
                        <div className="detail-item">
                          <label>Policy Type:</label>
                          <span>{selectedRequest.policy_assignment_type}</span>
                        </div>
                        <div className="detail-item">
                          <label>Assign Immediately:</label>
                          <span>{selectedRequest.policy_assign_immediately ? 'Yes' : 'No'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedRequest.managed_identities && (
                <div className="detail-section">
                  <h3>Managed Identities</h3>
                  <div className="managed-identities">
                    {JSON.parse(selectedRequest.managed_identities).map((identity: {name: string, role: string}, index: number) => (
                      <div key={index} className="identity-item">
                        <span className="identity-name">{identity.name}</span>
                        <span className="identity-role">{identity.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="secondary-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default ViewRequests;
