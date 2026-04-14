import React, { useState, useEffect } from 'react';
import { MOCK_USER, MOCK_CONTACTS } from '../mockData';
import { User, Phone, Droplet, Activity, ShieldAlert, Settings, Plus, Save, Trash2, Edit2, Link } from 'lucide-react';

export default function Profile() {
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

  const panelClass = "bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm rounded-xl p-6 mb-8 transition-all overflow-hidden";

  return (
    <div className="container animate-fade-in flex-col w-full pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-900">Identity</h2>
        <Settings size={24} className="text-slate-400 hover:rotate-90 transition-transform duration-300" />
      </div>

      {/* User Info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base flex items-center gap-2 font-semibold text-slate-800"><User size={18} className="text-slate-800" strokeWidth={2}/> Personal Info</h3>
        {!isEditingUser ? (
          <button onClick={() => setIsEditingUser(true)} className="flex items-center gap-1 text-slate-700 font-medium text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
            <Edit2 size={12}/> Edit
          </button>
        ) : (
          <button onClick={handleSaveUser} className="flex items-center gap-1 text-white font-medium text-xs bg-slate-900 px-4 py-1.5 rounded-md hover:bg-slate-800 transition-colors shadow-sm">
            <Save size={12}/> Save
          </button>
        )}
      </div>

      <div className={panelClass}>
        {!isEditingUser ? (
          <>
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
              <div className="bg-slate-100 border border-slate-200 rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm">
                {userData.name.charAt(0)}
              </div>
              <div>
                <h3 className="m-0 text-xl font-bold text-slate-900">{userData.name}</h3>
                <span className="text-sm font-medium text-slate-500">{userData.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Blood Group</span>
                <span className="font-bold text-slate-800 text-lg">{userData.bloodGroup}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conditions</span>
                <span className="font-medium text-slate-700">{userData.medicalConditions}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Full Name</label>
              <input type="text" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className="w-full p-2.5 font-medium border rounded-lg border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Phone Number</label>
              <input type="tel" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} className="w-full p-2.5 font-medium border rounded-lg border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 transition-colors" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Blood Group</label>
                <input type="text" value={userData.bloodGroup} onChange={e => setUserData({...userData, bloodGroup: e.target.value})} className="w-full p-2.5 font-medium border rounded-lg border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 transition-colors" />
              </div>
              <div className="flex-[2]">
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Conditions</label>
                <input type="text" value={userData.medicalConditions} onChange={e => setUserData({...userData, medicalConditions: e.target.value})} className="w-full p-2.5 font-medium border rounded-lg border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 transition-colors" placeholder="e.g. Asthma" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <h3 className="text-base mb-3 flex items-center justify-between font-semibold text-slate-800 px-1">
        <div className="flex items-center gap-2"><Link size={18}/> Emergency Contacts</div>
      </h3>
      <div className={`${panelClass} px-0 py-0 flex-col`}>
        {contacts.map((contact, idx) => (
          <div key={contact.id} className={`p-5 flex justify-between items-center ${idx < contacts.length - 1 ? 'border-b border-slate-100' : ''}`}>
            {editingContactId === contact.id ? (
              <div className="flex-col w-full gap-3">
                <input 
                  autoFocus
                  placeholder="Name"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-medium mb-3 focus:outline-none focus:border-slate-800 transition-colors" 
                  value={contact.name} onChange={e => updateContact(contact.id, 'name', e.target.value)} 
                />
                <input 
                  placeholder="Phone"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-medium mb-4 focus:outline-none focus:border-slate-800 transition-colors" 
                  value={contact.phone} onChange={e => updateContact(contact.id, 'phone', e.target.value)} 
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => removeContact(contact.id)} className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={16}/></button>
                  <button onClick={() => setEditingContactId(null)} className="px-5 py-2.5 font-medium text-xs text-white bg-slate-900 rounded-lg shadow-sm hover:bg-slate-800 transition-colors"><Save size={14} className="inline mr-1 -mt-0.5"/> Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-slate-800">{contact.name}</div>
                  <div className="text-sm text-slate-500">{contact.phone}</div>
                </div>
                <button onClick={() => setEditingContactId(contact.id)} className="text-slate-400 p-2 hover:bg-slate-50 hover:text-slate-800 rounded-md transition-colors">
                  <Edit2 size={16}/>
                </button>
              </>
            )}
          </div>
        ))}
        
        <div className="flex border-t border-slate-100 bg-slate-50/50">
          <div onClick={importContacts} className="flex-1 p-4 text-center text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 border-r border-slate-100">
             Import
          </div>
          <div onClick={handleAddContact} className="flex-1 p-4 text-center text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
            <Plus size={14}/> Add New
          </div>
        </div>
      </div>

      {/* Permissions Hardware Bindings */}
      <h3 className="text-base mb-3 mt-8 flex items-center font-semibold text-slate-800 px-1"><ShieldAlert size={18} className="mr-2"/> Permissions</h3>
      <div className={`${panelClass} p-2`}>
        <div className="flex justify-between items-center py-4 px-4 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-800">Location Access</span>
            <span className="text-xs text-slate-500">For accurate ETA routing</span>
          </div>
          <button onClick={checkLocation} className="text-xs font-medium px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            Check
          </button>
        </div>

        <div className="flex justify-between items-center py-4 px-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-800">Camera & Mic</span>
            <span className="text-xs text-slate-500">For AI Analysis</span>
          </div>
          <button onClick={checkCameraAndMic} className="text-xs font-medium px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            Request
          </button>
        </div>
      </div>

      {/* API Configuration */}
      <h3 className="text-base mb-3 mt-8 flex items-center font-semibold text-slate-800 px-1"><Settings size={18} className="mr-2"/> Developer</h3>
      <div className={`${panelClass} p-6`}>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Supply a valid Gemini API Key to enable real-time multimodal image classification.
        </p>
        <div className="relative">
          <input 
            type="password" 
            placeholder="AIza..."
            defaultValue={localStorage.getItem('gemini_api_key') || ''}
            onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
            className="w-full p-3 font-mono text-sm bg-slate-50 border rounded-lg border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 transition-colors"
          />
        </div>
      </div>
      
      <p className="text-xs font-bold text-slate-300 text-center mt-6 pb-4">
        UERN Core Module 1.0.0
      </p>
    </div>
  );
}
