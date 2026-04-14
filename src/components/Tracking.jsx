import React, { useState, useEffect } from 'react';
import { MapPin, PhoneCall, AlertCircle, Shield, Activity, Flame, Train, MessageSquare, CheckCircle } from 'lucide-react';

export default function Tracking({ request, onCancel, contactsAlerted }) {
  const [eta, setEta] = useState(0);
  const [statusText, setStatusText] = useState('Unit Assigned');

  useEffect(() => {
    if (request && request.units && request.units.length > 0) {
      // Find max ETA among assigned units (simplification)
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
      }, 1000); // 1 sec simulation for 1 min

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
    <div className="container animate-slide-up flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h2>Emergency Active</h2>
        <div className="badge badge-danger">ID: {request.id}</div>
      </div>

      {/* Map Simulation */}
      <div className="map-container relative">
        <div className="map-marker user"></div>
        {request.units.map((unit, idx) => (
          <div 
            key={unit.id} 
            className={`map-marker ${unit.service}`}
            style={{ 
              top: `${Math.max(10, 50 - (eta * 2))}%`, 
              left: `${Math.max(10, 50 + (eta * (idx % 2 === 0 ? 1 : -1)))}%`,
              transition: 'all 1s linear'
            }}
          >
            {renderIcon(unit.service)}
          </div>
        ))}
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="m-0 text-lg font-semibold">{statusText}</h3>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-universal)' }}>
            {eta > 0 ? `${eta} MIN` : 'NOW'}
          </span>
        </div>
        
        <div className="progress-bar mb-4">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${eta === 0 ? 100 : 100 - (eta * 10)}%`, background: 'var(--color-success)' }}
          ></div>
        </div>

        <div className="flex-col gap-2">
          {request.units.map(unit => (
            <div key={unit.id} className="flex justify-between items-center py-2 border-t">
              <div className="flex items-center gap-2">
                <div className={`icon-wrapper icon-${unit.service}`} style={{ width: '2rem', height: '2rem' }}>
                  {renderIcon(unit.service)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{unit.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{unit.service}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification status */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 mb-4" style={{ background: 'var(--color-success-bg)', borderColor: '#bbf7d0', color: 'var(--color-success)' }}>
        <div className="flex items-center gap-2">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Emergency Contacts Alerted</span>
        </div>
      </div>

      <div className="mt-auto pt-4 flex gap-2">
        <button className="btn btn-secondary flex-1" onClick={onCancel}>
          Cancel Request
        </button>
        <button className="btn btn-primary flex-1">
          <PhoneCall size={18} /> Call Unit
        </button>
      </div>
    </div>
  );
}
