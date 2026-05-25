import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfileAPI } from '../api/axios';
import { User, Lock, Palette, Bell, Globe, Camera } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dept: user?.dept || 'engineering'
  });
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileAPI(profileForm);
      updateUser(res.data.user);
      showMsg('Profile updated successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handlePassUpdate = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) return showMsg('Passwords do not match', 'error');
    try {
      await updateProfileAPI({ password: passForm.new });
      showMsg('Password changed successfully!');
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {msg.text && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              {msg.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="glass-card p-6 animate-slide-in">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><User size={20} className="text-cyan-400" /> Edit Profile</h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/30 bg-white/5 flex items-center justify-center">
                    {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={40} className="text-gray-600" />}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <Camera size={20} className="text-white" />
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{user?.name}</h4>
                  <p className="text-sm text-cyan-400">{user?.empId}</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                  <input className="input-field" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <input className="input-field" value={profileForm.email} readOnly style={{opacity: 0.6}} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                  <input className="input-field" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Department</label>
                  <select className="input-field" value={profileForm.dept} onChange={e => setProfileForm({...profileForm, dept: e.target.value})}>
                    <option value="ai-ml">AI / Machine Learning</option>
                    <option value="web-development">Web Development</option>
                    <option value="engineering">Engineering</option>
                    <option value="data-science">Data Science</option>
                  </select>
                </div>
                <button type="submit" className="neon-btn text-white text-sm md:col-span-2 mt-4">Save Profile</button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="glass-card p-6 animate-slide-in">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Lock size={20} className="text-cyan-400" /> Change Password</h3>
              <form onSubmit={handlePassUpdate} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Current Password</label>
                  <input type="password" className="input-field" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                  <input type="password" className="input-field" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Confirm New Password</label>
                  <input type="password" className="input-field" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
                </div>
                <button type="submit" className="neon-btn text-white text-sm mt-4">Update Password</button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card p-6 animate-slide-in">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Palette size={20} className="text-cyan-400" /> Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <div className="font-semibold text-sm">Dark Mode</div>
                    <p className="text-xs text-gray-500 mt-1">Enable dark theme across the portal</p>
                  </div>
                  <div className="w-12 h-6 bg-cyan-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <div className="font-semibold text-sm">Compact Sidebar</div>
                    <p className="text-xs text-gray-500 mt-1">Use a slimmer sidebar navigation</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative border border-white/20"><div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full shadow-sm" /></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add more tabs as placeholders for now */}
          {['notifications', 'language'].includes(activeTab) && (
            <div className="glass-card p-6 text-center text-gray-500 py-12 italic">
              This setting feature is coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
