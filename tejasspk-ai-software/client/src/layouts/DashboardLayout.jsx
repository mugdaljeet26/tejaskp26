import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Clock, Calendar, Shield, Settings, LogOut,
  CalendarCheck, Menu, X, FileText, Upload
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: CalendarCheck, label: 'Attendance' },
  { to: '/checkin', icon: Clock, label: 'Check-In/Out' },
  { to: '/documents', icon: Upload, label: 'Weekly Submission' },
  { to: '/report', icon: FileText, label: 'Report' },
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-[#05070a]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col glass-card border-r border-white/10 rounded-none transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00f2ff,#bc13fe)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"/></svg>
          </div>
          <div>
            <div className="font-bold text-sm" style={{ background: 'linear-gradient(135deg,#00f2ff,#bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tejaskp AI</div>
            <div className="text-xs text-gray-500">Software</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems
            .filter(({ to }) => to !== '/admin' || isAdmin)
            .map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                onClick={() => setSidebarOpen(false)}>
                <Icon size={18} /> {label}
              </NavLink>
            ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 flex items-center justify-center bg-white/5">
              {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-cyan-400">{user?.name?.[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-cyan-400">{user?.empId}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full text-sm font-medium transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#05070a]/80 backdrop-blur sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white"><Menu size={22} /></button>
          <span className="text-sm font-bold" style={{ background: 'linear-gradient(135deg,#00f2ff,#bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tejaskp AI</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 flex items-center justify-center bg-white/5">
            {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-cyan-400">{user?.name?.[0]}</span>}
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
