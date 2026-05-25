import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#05070a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-5xl px-6">
        <div className="text-center mb-16 animate-slide-in">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-cyan-500/20 bg-gradient-to-br from-[#00f2ff] to-[#bc13fe]">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"/></svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Tejaskp <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI Software</span></h1>
          <p className="text-gray-400 text-lg">Select your portal to continue to the system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          
          {/* User Portal Option */}
          <div 
            onClick={() => navigate('/login')}
            className="group glass-card p-12 cursor-pointer border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
              <Users size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">User Login</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">Access your employee dashboard, check-in for work, and manage your attendance records.</p>
            <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all group-hover:px-10">
              Enter User Portal <ArrowRight size={18} />
            </button>
          </div>

          {/* Admin Portal Option */}
          <div 
            onClick={() => navigate('/admin-login')}
            className="group glass-card p-12 cursor-pointer border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 text-purple-400 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Admin Login</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">Manage company resources, monitor employee attendance, and approve administrative requests.</p>
            <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-purple-500 text-white font-bold hover:bg-purple-400 transition-all group-hover:px-10">
              Enter Admin Portal <ArrowRight size={18} />
            </button>
          </div>

        </div>

        <p className="text-center mt-20 text-gray-600 text-sm font-medium">© 2026 Tejaskp AI Software · Security & Excellence</p>
      </div>
    </div>
  );
}

