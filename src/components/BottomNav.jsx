import React from 'react';
import { Home, Camera, User, History } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
        onClick={() => setActiveTab('home')}
      >
        <Home size={24} />
        <span>Home</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`} 
        onClick={() => setActiveTab('ai')}
      >
        <Camera size={24} />
        <span>Analyze</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
        onClick={() => setActiveTab('profile')}
      >
        <User size={24} />
        <span>Profile</span>
      </div>
    </div>
  );
}
