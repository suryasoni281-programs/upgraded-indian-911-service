import React, { useState } from 'react';
import { MOCK_USER, MOCK_CONTACTS } from '../mockData';
import { 
  User, Phone, Droplet, Activity, 
  MapPin, Video, Settings, Plus, 
  Save, Trash2, Edit2, Link, ChevronRight, X 
} from 'lucide-react';

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

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-y-auto animate-fade-in pb-12">
      
      {/* Top Header / Avatar Section */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 flex flex-col items-center">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-md mb-4">
          {userData.name.charAt(0)}
        </div>
        
        {!isEditingUser ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight m-0">{userData.name}</h2>
            <p className="text-slate-500 font-medium mt-1 mb-5">{userData.phone}</p>
            <button 
              onClick={() => setIsEditingUser(true)} 
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-full transition-colors"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <div className="w-full max-w-sm px-6 flex flex-col gap-3">
            <input 
              type="text" 
              value={userData.name} 
              onChange={e => setUserData({...userData, name: e.target.value})} 
              className="w-full p-3 font-medium bg-slate-50 border rounded-xl border-slate-200 focus:outline-none focus:border-slate-400 text-slate-900 text-center" 
              placeholder="Full Name"
            />
            <input 
              type="tel" 
              value={userData.phone} 
              onChange={e => setUserData({...userData, phone: e.target.value})} 
              className="w-full p-3 font-medium bg-slate-50 border rounded-xl border-slate-200 focus:outline-none focus:border-slate-400 text-slate-900 text-center" 
              placeholder="Phone"
            />
            <div className="flex gap-2 w-full mt-2">
              <button onClick={() => setIsEditingUser(false)} className="flex-1 py-3 text-slate-600 font-semibold bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleSaveUser} className="flex-1 py-3 text-white font-semibold bg-slate-900 rounded-xl">Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Banner */}
      <div className="bg-white border-b border-slate-200 flex justify-around py-4">
        <div className="text-center flex-1 border-r border-slate-100 px-2">
          {!isEditingUser ? (
            <>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><Droplet size={10}/> Blood</div>
              <div className="font-bold text-slate-800 text-lg">{userData.bloodGroup}</div>
            </>
          ) : (
            <input value={userData.bloodGroup} onChange={e => setUserData({...userData, bloodGroup: e.target.value})} className="w-full text-center p-1 font-bold text-slate-800 border-b border-slate-300 focus:outline-none bg-transparent" placeholder="e.g. O+"/>
          )}
        </div>
        <div className="text-center flex-1 px-2">
          {!isEditingUser ? (
            <>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><Activity size={10}/> Condition</div>
              <div className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{userData.medicalConditions || 'None'}</div>
            </>
          ) : (
            <input value={userData.medicalConditions} onChange={e => setUserData({...userData, medicalConditions: e.target.value})} className="w-full text-center p-1 font-bold text-slate-800 border-b border-slate-300 focus:outline-none bg-transparent text-sm" placeholder="e.g. Asthma"/>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-2">
        
        {/* iOS-Style Settings Groups */}
        
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">Emergency Contacts</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          {contacts.map((contact, idx) => (
            <div key={contact.id} className={`flex flex-col p-4 ${idx < contacts.length - 1 ? 'border-b border-slate-100' : ''}`}>
              {editingContactId === contact.id ? (
                <div className="w-full animate-fade-in flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-800">Edit Contact</span>
                    <X size={18} className="text-slate-400 cursor-pointer" onClick={() => setEditingContactId(null)}/>
                  </div>
                  <input autoFocus placeholder="Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-slate-800" value={contact.name} onChange={e => updateContact(contact.id, 'name', e.target.value)} />
                  <input placeholder="Phone / Comms ID" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-slate-800" value={contact.phone} onChange={e => updateContact(contact.id, 'phone', e.target.value)} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => removeContact(contact.id)} className="p-3 text-red-500 bg-red-50 rounded-xl flex items-center justify-center"><Trash2 size={18}/></button>
                    <button onClick={() => setEditingContactId(null)} className="flex-1 py-3 text-white font-semibold bg-slate-900 rounded-xl">Save Contact</button>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex justify-between items-center cursor-pointer group" 
                  onClick={() => setEditingContactId(contact.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-slate-200 transition-colors">
                      {contact.name ? contact.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{contact.name || 'Unnamed'}</div>
                      <div className="text-sm font-medium text-slate-500">{contact.phone || 'No Number'}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
          
          <div className="flex border-t border-slate-100 bg-slate-50/50">
            <div onClick={importContacts} className="flex-1 py-4 text-center text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 border-r border-slate-100 transition-colors">
              Import Device
            </div>
            <div onClick={handleAddContact} className="flex-1 py-4 text-center text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              Add Manual
            </div>
          </div>
        </div>

        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3 mt-8">System Permissions</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          
          <div className="flex justify-between items-center p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors" onClick={checkLocation}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <MapPin size={16} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Location Services</div>
                <div className="text-xs text-slate-500">Requires precision routing</div>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Test</span>
          </div>

          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={checkCameraAndMic}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Video size={16} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Sensors & Mic</div>
                <div className="text-xs text-slate-500">For AI Feed Analysis</div>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Test</span>
          </div>
        </div>

        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3 mt-8">Developer Integrations</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Settings size={14} />
            </div>
            <div className="font-semibold text-slate-900">Gemini Neural Token</div>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Supply a valid API key to unlock raw multimodal inference streaming. This token is stored exclusively on this device.
          </p>
          <input 
            type="password" 
            placeholder="AIza..."
            defaultValue={localStorage.getItem('gemini_api_key') || ''}
            onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
            className="w-full p-3 font-mono text-sm bg-slate-50 border rounded-xl border-slate-200 focus:outline-none focus:border-slate-800 text-slate-900"
          />
        </div>
        
        <p className="text-xs text-center text-slate-400 mt-8 mb-4 font-medium uppercase tracking-widest">
          UERN App v1.0
        </p>
      </div>
    </div>
  );
}
