import React from 'react';
import { Shield, Flame, Train, Activity, AlertTriangle, WifiOff, Zap } from 'lucide-react';

export default function Home({ onTriggerEmergency, isOffline }) {
  const handleUniversal = () => {
    onTriggerEmergency('universal');
  };

  return (
    <div className="container animate-fade-in flex-col flex w-full h-full">
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-10 pt-2">
        <div>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight text-slate-800">
            UERN <span className="text-slate-400">Sync</span>
          </h1>
          <p className="text-xs text-slate-500 m-0 px-3 py-1.5 rounded-full inline-block mt-2 bg-slate-100 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2 animate-pulse"></span>
            System Online
          </p>
        </div>
        {isOffline && (
          <div className="badge badge-danger flex items-center gap-2">
            <WifiOff size={14} /> SMS Fallback
          </div>
        )}
      </div>

      <p className="text-base text-slate-500 mb-8 max-w-lg">
        Select a specific responder unit or deploy all nearby agencies instantly.
      </p>

      {/* Main Grid */}
      <div className="service-grid">
        <div className="service-card" onClick={() => onTriggerEmergency('police')}>
          <div className="icon-wrapper icon-police">
            <Shield size={28} strokeWidth={2} />
          </div>
          <span className="font-semibold text-slate-800">Police</span>
        </div>
        
        <div className="service-card" onClick={() => onTriggerEmergency('ambulance')}>
          <div className="icon-wrapper icon-ambulance">
            <Activity size={28} strokeWidth={2} />
          </div>
          <span className="font-semibold text-slate-800">Ambulance</span>
        </div>
        
        <div className="service-card" onClick={() => onTriggerEmergency('fire')}>
          <div className="icon-wrapper icon-fire">
            <Flame size={28} strokeWidth={2} />
          </div>
          <span className="font-semibold text-slate-800">Fire</span>
        </div>
        
        <div className="service-card" onClick={() => onTriggerEmergency('railway')}>
          <div className="icon-wrapper icon-railway">
            <Train size={28} strokeWidth={2} />
          </div>
          <span className="font-semibold text-slate-800">Railway</span>
        </div>
      </div>

      {/* Universal Button Area */}
      <div className="flex-col items-center mt-auto mb-6" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn-universal flex-col items-center relative"
          onClick={handleUniversal}
        >
          <AlertTriangle size={36} strokeWidth={2.5} style={{ marginBottom: '8px' }} />
          <span>UNIVERSAL DISPATCH</span>
        </button>
        <p className="text-center text-xs mt-6 font-semibold tracking-widest text-slate-400">
          <Zap size={14} className="inline mr-1" />
          ALERTS ALL NEARBY SERVICES
        </p>
      </div>
    </div>
  );
}
