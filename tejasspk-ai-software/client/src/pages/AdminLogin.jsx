import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const data = await login(form.email, form.password);
      if (data.role !== 'admin') {
        // If not an admin, logout immediately and show error
        localStorage.removeItem('userInfo');
        setLocalError('Access denied: Only administrators can log in here.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 20% 50%,rgba(0,242,255,0.05) 0%,transparent 60%), radial-gradient(ellipse at 80% 50%,rgba(188,19,254,0.05) 0%,transparent 60%), #05070a' }}>
      <div className="glass-card p-8 w-full max-w-md mx-4 animate-slide-in border-cyan-500/30">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50">
            <ShieldCheck size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Tejaskp AI Software Secure Access</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button onClick={() => navigate('/login')} className="flex-1 py-2 text-sm font-semibold rounded-lg text-gray-400 hover:text-white transition-all">Employee</button>
          <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-cyan-500 text-black">Admin</button>
        </div>

        {(authError || localError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Admin Email</label>
            <input type="email" className="input-field" placeholder="admin@tejaskp.ai" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-cyan-500" />
              Remember me
            </label>
            <button type="button" className="hover:text-cyan-400 transition-colors">Forgot password?</button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all flex items-center justify-center gap-2">
            {loading ? 'Authenticating...' : <><ShieldCheck size={18} /> Admin Sign In</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <Link to="/login" className="text-xs text-gray-500 hover:text-cyan-400">Standard Employee Login</Link>
        </div>
      </div>
    </div>
  );
}
