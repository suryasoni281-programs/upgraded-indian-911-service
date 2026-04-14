import React, { useState, useEffect } from 'react';
import { MOCK_USER, MOCK_CONTACTS } from '../mockData';
import { User, Phone, Droplet, Activity, ShieldAlert, Settings, Plus, Save, Trash2, Edit2, Link } from 'lucide-react';

export default function Profile() {
  // Local storage bootstrap logic
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('uern_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('uern_contacts');
    return saved ? JSON.parse(saved) : MOCK_CONTACTS;
  });

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);

  // Sync to local storage
  const handleSaveUser = () => {
    localStorage.setItem('uern_user', JSON.stringify(userData));
    setIsEditingUser(false);
  };

  const syncContacts = (newContacts) => {
    setContacts(newContacts);
    localStorage.setItem('uern_contacts', JSON.stringify(newContacts));
  };

  const handleAddContact = () => {
    const newContact = { id: `c-manual-${Date.now()}`, name: '', phone: '' };
    syncContacts([...contacts, newContact]);
    setEditingContactId(newContact.id);
  };

  const removeContact = (id) => {
    syncContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id, field, value) => {
    syncContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // APIs
  const checkLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => alert(`Verified! Lat: ${position.coords.latitude.toFixed(3)}, Lng: ${position.coords.longitude.toFixed(3)}`),
      (error) => alert(`Location Error: ${error.message}`)
    );
  };

  const checkCameraAndMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      alert("System Connected to Optical & Audio Sensors!");
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      alert(`Sensor Error: ${err.message}`);
    }
  };

  const importContacts = async () => {
    const supported = ('contacts' in navigator && 'ContactsManager' in window);
    if (!supported) {
      alert("Native Contact Access restricted to advanced Android Chrome structures. Please add manually.");
      return;
    }
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      const selected = await navigator.contacts.select(props, opts);
      if (selected && selected.length > 0) {
        const newContacts = selected.map((c, i) => ({
          id: `c-imported-${Date.now()}-${i}`,
          name: c.name && c.name.length ? c.name[0] : 'Unknown',
          phone: c.tel && c.tel.length ? c.tel[0] : 'No Number'
        }));
        syncContacts([...contacts, ...newContacts]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const glassPanelClass = "bg-[var(--bg-secondary)] backdrop-blur-xl border border-[rgba(255,255,255,0.8)] shadow-lg rounded-2xl p-5 mb-6 transition-all duration-300 relative overflow-hidden";

  return (
    <div className="container animate-fade-in flex-col w-full pb-10">
      <div className="flex justify-between items-center mb-6 pt-2">
        <h2 className="m-0 text-3xl font-extrabold tracking-tight">Identity</h2>
        <Settings size={28} className="text-slate-400 hover:rotate-90 transition-transform duration-300" />
      </div>

      {/* User Info Glass Panel */}
      <h3 className="text-lg mb-3 flex items-center justify-between font-bold text-slate-800 tracking-wide px-2">
        <div className="flex items-center gap-2"><User size={20} className="text-blue-500"/> BIOS DATABANK</div>
        {!isEditingUser ? (
          <button onClick={() => setIsEditingUser(true)} className="flex items-center gap-1 text-blue-600 font-bold text-xs bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-200 hover:bg-white transition-all shadow-sm">
            <Edit2 size={12}/> Edit Data
          </button>
        ) : (
          <button onClick={handleSaveUser} className="flex items-center gap-1 text-white font-bold text-xs bg-green-500 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-105 transition-all">
            <Save size={12}/> Save Target
          </button>
        )}
      </h3>

      <div className={glassPanelClass}>
        {!isEditingUser ? (
          <>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-200/50">
              <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                {userData.name.charAt(0)}
              </div>
              <div>
                <h3 className="m-0 text-xl font-bold">{userData.name}</h3>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Phone size={12}/> {userData.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-white/40 rounded-xl border border-white/60">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 tracking-wider"><Droplet size={14}/> Blood Group</span>
                <span className="font-extrabold text-red-500 text-lg drop-shadow-sm">{userData.bloodGroup}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white/40 rounded-xl border border-white/60">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 tracking-wider"><Activity size={14}/> Conditions</span>
                <span className="font-bold text-slate-800 text-sm leading-tight">{userData.medicalConditions}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Full Identity</label>
              <input type="text" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className="w-full p-3 font-semibold bg-white/60 backdrop-blur-sm border rounded-xl border-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-slate-800" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Comms Frequency</label>
              <input type="tel" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} className="w-full p-3 font-semibold bg-white/60 backdrop-blur-sm border rounded-xl border-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-slate-800" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Blood Sector</label>
                <input type="text" value={userData.bloodGroup} onChange={e => setUserData({...userData, bloodGroup: e.target.value})} className="w-full p-3 font-semibold bg-white/60 backdrop-blur-sm border rounded-xl border-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-red-600 text-center" />
              </div>
              <div className="flex-[2]">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Anomalies/Conditions</label>
                <input type="text" value={userData.medicalConditions} onChange={e => setUserData({...userData, medicalConditions: e.target.value})} className="w-full p-3 font-semibold bg-white/60 backdrop-blur-sm border rounded-xl border-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-slate-800" placeholder="e.g. Asthma..." />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts Panel */}
      <h3 className="text-lg mb-3 flex items-center justify-between font-bold text-slate-800 tracking-wide px-2">
        <div className="flex items-center gap-2"><Link size={20} className="text-indigo-500"/> SECURE RESPONDERS</div>
      </h3>
      <div className={`${glassPanelClass} px-0 py-0 flex-col overflow-visible`}>
        {contacts.map((contact, idx) => (
          <div key={contact.id} className={`p-4 flex justify-between items-center bg-white/30 backdrop-blur-md ${idx < contacts.length - 1 ? 'border-b border-black/5' : ''}`}>
            {editingContactId === contact.id ? (
              <div className="flex-col w-full gap-2">
                <input 
                  autoFocus
                  placeholder="Responder Name"
                  className="w-full p-2 bg-white/80 border border-slate-200 rounded-lg text-sm font-bold mb-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400" 
                  value={contact.name} onChange={e => updateContact(contact.id, 'name', e.target.value)} 
                />
                <input 
                  placeholder="Comms ID (Phone)"
                  className="w-full p-2 bg-white/80 border border-slate-200 rounded-lg text-sm font-semibold mb-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400" 
                  value={contact.phone} onChange={e => updateContact(contact.id, 'phone', e.target.value)} 
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button onClick={() => removeContact(contact.id)} className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                  <button onClick={() => setEditingContactId(null)} className="px-5 py-2 font-bold text-xs text-white bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"><Save size={14} className="inline mr-1 -mt-1"/> SAVE</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="font-bold text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">{contact.name}</div>
                  <div className="text-xs font-semibold text-slate-500 tracking-wide">{contact.phone}</div>
                </div>
                <button onClick={() => setEditingContactId(contact.id)} className="text-indigo-600 bg-white/80 backdrop-blur-xl border border-indigo-100 p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                  <Edit2 size={16}/>
                </button>
              </>
            )}
          </div>
        ))}
        
        <div className="flex border-t border-black/5 bg-slate-50/50 backdrop-blur-md">
          <div onClick={importContacts} className="flex-1 p-3 text-center text-xs font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 border-r border-black/5">
             NATIVE SYNC
          </div>
          <div onClick={handleAddContact} className="flex-1 p-3 text-center text-xs font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1">
            <Plus size={14}/> NEW RECORD
          </div>
        </div>
      </div>

      {/* Permissions Hardware Bindings */}
      <h3 className="text-lg mb-3 mt-4 flex items-center font-bold text-slate-800 tracking-wide px-2"><ShieldAlert size={20} className="text-red-500 mr-2"/> HARDWARE UPLINKS</h3>
      <div className={`${glassPanelClass} p-3`}>
        <div className="flex justify-between items-center py-3 px-3 border-b border-black/5">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800">Satellite Relay</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GPS Trajectory</span>
          </div>
          <button onClick={checkLocation} className="text-xs font-bold px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-700 hover:shadow-md transition-shadow">
            Ping
          </button>
        </div>

        <div className="flex justify-between items-center py-3 px-3">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800">Visual/Audio Sensors</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Inference Source</span>
          </div>
          <button onClick={checkCameraAndMic} className="text-xs font-bold px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-700 hover:shadow-md transition-shadow">
            Mount
          </button>
        </div>
      </div>

      {/* API Configuration */}
      <h3 className="text-lg mb-3 mt-4 flex items-center font-bold text-slate-800 tracking-wide px-2"><Settings size={20} className="text-slate-500 mr-2"/> DEEP CORE ENGINE</h3>
      <div className={`${glassPanelClass} p-5`}>
        <p className="text-xs font-bold text-slate-500 mb-3 tracking-wide leading-relaxed">
          Supply a secure Gemini API Key token to unlock absolute realtime AI cognitive processing.
        </p>
        <div className="relative">
          <input 
            type="password" 
            placeholder="AIzaSy... (Authenticate Token)"
            defaultValue={localStorage.getItem('gemini_api_key') || ''}
            onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
            className="w-full p-3 pl-4 pr-10 font-mono text-sm bg-white/70 backdrop-blur-md border rounded-xl border-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner text-indigo-900"
          />
          <div className="absolute right-3 top-3.5 w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></div>
        </div>
      </div>
      
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center mt-2 pb-6">
        UERN Core Module 1.0.0
      </p>
    </div>
  );
}
