import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, HelpCircle, Info } from 'lucide-react';

export default function Login() {
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('employee'); // 'employee' or 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const data = await login(form.email, form.password);
      if (role === 'admin' && data.role !== 'admin') {
        localStorage.removeItem('userInfo');
        setLocalError('Access Denied. Admin Only.');
        return;
      }
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#05070a]">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="glass-card p-10 w-full max-w-lg mx-4 animate-slide-in border-white/5">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-cyan-500/10 bg-gradient-to-br from-cyan-400 to-blue-600">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tejaskp <span className="text-cyan-400">AI</span></h1>
          <p className="text-gray-500 text-sm mt-1">Enterprise Management Portal</p>
        </div>

        {(authError || localError) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm font-medium">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection (Matching Photo) */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
              <span className="text-red-500">*</span> Role
            </label>
            <div className="flex gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="role" value="employee" checked={role === 'employee'} onChange={() => setRole('employee')}
                  className="w-5 h-5 border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 cursor-pointer" />
                <span className={`text-sm transition-colors ${role === 'employee' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>Staff</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')}
                  className="w-5 h-5 border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 cursor-pointer" />
                <span className={`text-sm transition-colors ${role === 'admin' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>Admin</span>
              </label>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
              <span className="text-red-500">*</span> Username
            </label>
            <input type="email" className="input-field py-4" placeholder="Mobile No. / Email / Staff Code"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1"><span className="text-red-500">*</span> Password <Info size={14} className="text-gray-600" /></span>
            </label>
            <input type={showPass ? 'text' : 'password'} className="input-field py-4" placeholder="Password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          {/* Show Password Checkbox */}
          <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer w-max hover:text-gray-300 transition-colors">
            <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)}
              className="w-5 h-5 rounded border-white/10 bg-white/5 accent-cyan-500 cursor-pointer" />
            Show Password
          </label>

          {/* Buttons (Matching Photo Layout) */}
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} 
              className="flex-1 bg-[#2eb8b8] hover:bg-[#269999] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10">
              {loading ? 'Processing...' : 'Login'}
            </button>
            <button type="button" className="flex-1 bg-[#f05a5a] hover:bg-[#e04a4a] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/10">
              Forgot Password
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-xs mt-10">
          © 2026 Tejaskp AI Software. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
