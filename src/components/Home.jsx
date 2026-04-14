import React, { useState } from 'react';
import { Shield, Flame, Train, Activity, AlertTriangle, WifiOff, Zap } from 'lucide-react';

export default function Home({ onTriggerEmergency, isOffline }) {
  const handleUniversal = () => {
    onTriggerEmergency('universal');
  };

  return (
    <div className="container animate-fade-in flex-col flex w-full">
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="m-0 text-2xl" style={{ letterSpacing: '-0.03em' }}>
            UERN <span className="text-blue-600">Sync</span>
          </h1>
          <p className="text-xs text-slate-500 m-0 border border-slate-200 px-2 py-1 rounded-full inline-block mt-1 bg-white/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
            System Online & Monitoring
          </p>
        </div>
        {isOffline && (
          <div className="badge badge-danger flex items-center gap-2 shadow-sm">
            <WifiOff size={12} /> SMS Fallback
          </div>
        )}
      </div>

      <p className="text-sm text-slate-600 mb-6 drop-shadow-sm">
        Select a specific responder unit or deploy all nearby agencies instantly.
      </p>

      {/* Main Grid */}
      <div className="service-grid">
        <div className="service-card" onClick={() => onTriggerEmergency('police')}>
          <div className="icon-wrapper icon-police shadow-sm">
            <Shield size={28} />
          </div>
          <span className="font-bold text-slate-800">Police</span>
        </div>
        
        <div className="service-card" onClick={() => onTriggerEmergency('ambulance')}>
          <div className="icon-wrapper icon-ambulance shadow-sm">
            <Activity size={28} />
          </div>
          <span className="font-bold text-slate-800">Ambulance</span>
        </div>
        
        <div className="service-card" onClick={() => onTriggerEmergency('fire')}>
          <div className="icon-wrapper icon-fire shadow-sm">
            <Flame size={28} />
          </div>
          <span className="font-bold text-slate-800">Fire</span>
        </div>
        
        <div className="service-card" onClick={() => onTriggerEmergency('railway')}>
          <div className="icon-wrapper icon-railway shadow-sm">
            <Train size={28} />
          </div>
          <span className="font-bold text-slate-800">Railway</span>
        </div>
      </div>

      {/* Universal Button Area */}
      <div className="flex-col items-center mt-auto mb-4" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn-universal flex-col items-center relative animate-pulse-red"
          onClick={handleUniversal}
        >
          <AlertTriangle size={42} strokeWidth={2.5} style={{ marginBottom: '8px' }} />
          <span>UNIVERSAL DISPATCH</span>
        </button>
        <p className="text-center text-xs mt-6 font-bold" style={{ color: '#dc2626', letterSpacing: '0.05em' }}>
          <Zap size={12} className="inline mr-1" />
          ALERTS ALL NEARBY SERVICES
        </p>
      </div>
    </div>
  );
}
