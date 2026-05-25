import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const DEPTS = [
  { value: 'ai-ml', label: 'AI / Machine Learning' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'ai-research', label: 'AI Research' },
  { value: 'engineering', label: 'Software Engineering' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'product', label: 'Product Management' },
  { value: 'design', label: 'UI/UX Design' },
];

export default function Signup() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', dept: 'engineering' });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return; }
    if (form.password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    setFormError('');
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone, dept: form.dept });
      navigate('/dashboard');
    } catch {}
  };

  const strength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const s = strength(form.password);
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'][s] || '';
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong', 'Very Strong'][s] || '';

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ background: 'radial-gradient(ellipse at 20% 50%,rgba(0,242,255,0.05) 0%,transparent 60%), radial-gradient(ellipse at 80% 50%,rgba(188,19,254,0.05) 0%,transparent 60%), #05070a' }}>
      <div className="glass-card p-8 w-full max-w-md mx-4 animate-slide-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg,#00f2ff,#bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Register as an employee</p>
        </div>

        {(error || formError) && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">{error || formError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input type="text" className="input-field" placeholder="John Doe" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input type="email" className="input-field" placeholder="john@tejaskp.ai" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Phone</label>
            <input type="tel" className="input-field" placeholder="+91 00000 00000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Department</label>
            <select className="input-field" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})}>
              {DEPTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            {form.password && (
              <div className="mt-2">
                <div className="h-1.5 bg-white/10 rounded-full"><div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${(s/4)*100}%` }} /></div>
                <p className="text-xs mt-1 text-gray-400">{strengthLabel}</p>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
          </div>
          <button type="submit" disabled={loading} className="neon-btn w-full flex items-center justify-center gap-2 text-white">
            {loading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Sign In</Link></p>
      </div>
    </div>
  );
}
