import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Tracking from './components/Tracking';
import AIAnalysis from './components/AIAnalysis';
import Profile from './components/Profile';
import { backendSim } from './mockData';
import { AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeRequest, setActiveRequest] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Loading state when creating a request
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Permissions Modal state
  const [showPermissions, setShowPermissions] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Simulate App Load check for permissions, if it's first time
    const permsChecked = localStorage.getItem('uern_perms_checked');
    if (permsChecked) {
      setShowPermissions(false);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const acceptPermissions = () => {
    localStorage.setItem('uern_perms_checked', 'true');
    setShowPermissions(false);
  };

  const handleTriggerEmergency = async (serviceType) => {
    setIsProcessing(true);
    
    try {
      let unitsAssigned = [];
      
      // If universal, get all!
      if (serviceType === 'universal') {
        const p = await backendSim.getNearestUnit('police');
        const a = await backendSim.getNearestUnit('ambulance');
        const f = await backendSim.getNearestUnit('fire');
        // Filter out nulls
        unitsAssigned = [p, a, f].filter(Boolean); 
      } else {
        const u = await backendSim.getNearestUnit(serviceType);
        if (u) unitsAssigned.push(u);
      }
      
      if (unitsAssigned.length === 0) {
         alert("No units available nearby. Retrying in 10 seconds...");
         setIsProcessing(false);
         return;
      }

      const req = await backendSim.createEmergencyRequest(serviceType, unitsAssigned);
      
      setActiveRequest(req);
      setActiveTab('tracking'); // Ensure we are on tracking tab
    } catch (err) {
      console.error(err);
      alert("Error processing emergency. Activating offline SMS fallback.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelEmergency = () => {
    if(window.confirm("Are you sure you want to cancel the emergency request?")) {
      setActiveRequest(null);
      setActiveTab('home');
    }
  };

  // Render correct view based on active request and active tab
  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="container flex-col items-center justify-center text-center h-full">
          <Loader2 size={48} className="animate-spin text-red-600 mb-4" />
          <h2>Dispatching Units...</h2>
          <p>Locating the nearest available responders.</p>
        </div>
      );
    }

    if (activeRequest) {
      return <Tracking request={activeRequest} onCancel={cancelEmergency} contactsAlerted={true} />;
    }

    switch (activeTab) {
      case 'home':
        return <Home onTriggerEmergency={handleTriggerEmergency} isOffline={isOffline} />;
      case 'ai':
        return <AIAnalysis onTriggerEmergency={handleTriggerEmergency} />;
      case 'profile':
        return <Profile />;
      default:
        return <Home onTriggerEmergency={handleTriggerEmergency} isOffline={isOffline} />;
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </div>

        {/* Bottom Nav Simulation */}
        {!activeRequest && !isProcessing && (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>

      {/* Permissions Overlay */}
      {showPermissions && (
        <div className="bottom-sheet-backdrop z-50 flex items-center justify-center p-4" style={{ zIndex: 100 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-sm flex-col">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-blue-600" />
              <h2 className="m-0 text-xl font-bold">Permissions Required</h2>
            </div>
            <p className="text-sm mb-4">
              To function effectively in an emergency, UERN requires the following permissions:
            </p>
            <ul className="text-sm text-slate-600 list-disc pl-5 mb-6 flex-col gap-2">
              <li><strong>Location:</strong> To map your location.</li>
              <li><strong>Contacts/SMS:</strong> To alert family offline.</li>
              <li><strong>Camera:</strong> For AI emergency analysis.</li>
            </ul>
            <button className="btn btn-primary w-full" onClick={acceptPermissions}>
              Allow Access
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">
              You can revoke these later in Profile Settings.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
