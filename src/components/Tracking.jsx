import React, { useState, useEffect } from 'react';
import { MapPin, PhoneCall, AlertCircle, Shield, Activity, Flame, Train, CheckCircle } from 'lucide-react';

export default function Tracking({ request, onCancel, contactsAlerted }) {
  const [eta, setEta] = useState(0);
  const [statusText, setStatusText] = useState('Unit Assigned');

  useEffect(() => {
    if (request && request.units && request.units.length > 0) {
      const maxEta = Math.max(...request.units.map(u => u.eta));
      setEta(maxEta);
      
      const interval = setInterval(() => {
        setEta(prev => {
          if (prev <= 1) {
            setStatusText('Arriving');
            return 0;
          }
          if (prev <= maxEta / 2) {
            setStatusText('On the Way');
          }
          return prev - 1;
        });
      }, 1000); 

      return () => clearInterval(interval);
    }
  }, [request]);

  const renderIcon = (service) => {
    switch (service) {
      case 'police': return <Shield size={16} />;
      case 'ambulance': return <Activity size={16} />;
      case 'fire': return <Flame size={16} />;
      case 'railway': return <Train size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (!request) return null;

  return (
    <div className="container animate-fade-in flex-col h-full w-full">
      <div className="flex justify-between items-center mb-6 pt-2">
        <h2 className="m-0 text-3xl font-extrabold tracking-tight text-slate-800">Dispatch</h2>
        <div className="badge badge-danger">ID: {request.id}</div>
      </div>

      {/* Map Simulation - Minimal Style */}
      <div className="map-container relative shadow-sm">
        <div className="map-marker user"></div>
        {request.units.map((unit, idx) => (
          <div 
            key={unit.id} 
            className={`map-marker ${unit.service}`}
            style={{ 
              top: `${Math.max(10, 50 - (eta * 2))}%`, 
              left: `${Math.max(10, 50 + (eta * (idx % 2 === 0 ? 1 : -1)))}%`,
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)'
            }}
          >
            {renderIcon(unit.service)}
          </div>
        ))}
      </div>

      {/* Status Card Minimal */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-xl font-bold text-slate-900">{statusText}</h3>
          <span className="text-3xl font-extrabold tracking-tighter" style={{ color: 'var(--color-universal)' }}>
            {eta > 0 ? `${eta} MIN` : 'NOW'}
          </span>
        </div>
        
        <div className="progress-bar mb-6 bg-slate-100 h-2">
          <div 
            className="progress-bar-fill h-full bg-slate-900 rounded-full transition-all duration-1000" 
            style={{ width: `${eta === 0 ? 100 : 100 - (eta * 10)}%` }}
          ></div>
        </div>

        <div className="flex-col gap-3">
          {request.units.map((unit, i) => (
            <div key={unit.id} className={`flex justify-between items-center py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-2 rounded-full border border-slate-200 text-slate-800 bg-slate-50">
                  {renderIcon(unit.service)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800">{unit.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{unit.service} Unit</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification status Minimal */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={18} className="text-green-400" />
          <span className="text-sm font-semibold tracking-wide">Emergency Contacts Alerted</span>
        </div>
      </div>

      {/* Minimal Buttons */}
      <div className="mt-auto pt-4 flex gap-4">
        <button className="flex-1 py-3.5 px-4 bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors" onClick={onCancel}>
          Cancel
        </button>
        <button className="flex-1 py-3.5 px-4 bg-slate-900 text-white font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          <PhoneCall size={18} /> Call Unit
        </button>
      </div>
    </div>
  );
}
