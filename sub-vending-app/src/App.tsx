import { useState } from 'react'
import CreateRequest from './components/createRequest'
import ViewRequests from './components/ViewRequests'
import UpdateRequest from './components/updateRequest'
import UpdateRequestSimple from './components/updateRequestSimple'
import UpdateRequestMinimal from './components/updateRequestMinimal'
import UpdateRequestFixed from './components/updateRequestFixed'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'view' | 'update'>('home')

  return (
    <>
      {currentView === 'home' ? (
        <div className="home-container">
          <div className="hero-section">
            <h1>Azure Subscription Vending</h1>
            <p>Streamline your Azure subscription requests with our automated intake system</p>
            <div className="action-buttons">
              <button 
                className="primary-btn"
                onClick={() => setCurrentView('create')}
              >
                Create New Request
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setCurrentView('view')}
              >
                View Existing Requests
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setCurrentView('update')}
              >
                Update Request
              </button>
            </div>
          </div>
          
          <div className="features-section">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🚀 Quick Setup</h3>
                <p>Rapidly provision Azure subscriptions with standardized configurations</p>
              </div>
              <div className="feature-card">
                <h3>📋 Governance</h3>
                <p>Built-in compliance and governance policies for enterprise requirements</p>
              </div>
              <div className="feature-card">
                <h3>🔒 Security</h3>
                <p>Automated security controls and RBAC assignment</p>
              </div>
              <div className="feature-card">
                <h3>📊 Tracking</h3>
                <p>Full audit trail and request status monitoring</p>
              </div>
            </div>
          </div>
        </div>
      ) : currentView === 'create' ? (
        <CreateRequest />
      ) : currentView === 'view' ? (
        <ViewRequests />
      ) : currentView === 'update' ? (
        <UpdateRequest />
      ) : (
        <ViewRequests />
      )}
      
      <nav className="top-nav">
        <button 
          onClick={() => setCurrentView('home')}
          className={currentView === 'home' ? 'active' : ''}
        >
          Home
        </button>
        <button 
          onClick={() => setCurrentView('create')}
          className={currentView === 'create' ? 'active' : ''}
        >
          Create Request
        </button>
        <button 
          onClick={() => setCurrentView('view')}
          className={currentView === 'view' ? 'active' : ''}
        >
          View Requests
        </button>
        <button 
          onClick={() => setCurrentView('update')}
          className={currentView === 'update' ? 'active' : ''}
        >
          Update Request
        </button>
      </nav>
    </>
  )
}

export default App
