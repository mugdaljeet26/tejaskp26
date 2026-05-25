import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkInAPI, checkOutAPI, getMyAttendanceAPI } from '../api/axios';
import { MapPin, Clock, LogIn, LogOut, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CheckIn() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [location, setLocation] = useState('Fetching...');
  const [coords, setCoords] = useState(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const timerRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => { const s = `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`; setLocation(s); setCoords(s); },
      () => setLocation('Location denied')
    );
    fetchRecords();
  }, []);

  useEffect(() => {
    if (todayRecord?.checkIn && !todayRecord?.checkOut) {
      timerRef.current = setInterval(() => {
        const ms = Date.now() - new Date(todayRecord.checkIn).getTime();
        const h = String(Math.floor(ms/3600000)).padStart(2,'0');
        const m = String(Math.floor((ms%3600000)/60000)).padStart(2,'0');
        const s = String(Math.floor((ms%60000)/1000)).padStart(2,'0');
        setElapsed(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [todayRecord]);

  const fetchRecords = async () => {
    try {
      const res = await getMyAttendanceAPI();
      setRecords(res.data.records);
      const rec = res.data.records.find(r => r.date === today);
      setTodayRecord(rec || null);
    } catch {}
  };

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text: '', type: '' }), 3000); };

  const handleCheckIn = async () => {
    if (todayRecord) { showMsg('Already checked in today!', 'error'); return; }
    setLoading(true);
    try {
      await checkInAPI({ location: coords || location });
      showMsg('Checked in successfully! ✅');
      fetchRecords();
    } catch (e) { showMsg(e.response?.data?.message || 'Check-in failed', 'error'); }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!todayRecord || todayRecord.checkOut) { showMsg('Cannot check out now!', 'error'); return; }
    setLoading(true);
    try {
      await checkOutAPI();
      showMsg('Checked out successfully! 👋');
      clearInterval(timerRef.current);
      fetchRecords();
    } catch (e) { showMsg(e.response?.data?.message || 'Check-out failed', 'error'); }
    setLoading(false);
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 242, 255);
    doc.text('Attendance Report', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Employee: ${user.name} (${user.empId})`, 14, 30);
    doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 35);
    
    const tableData = records.map(r => [
      r.date,
      r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '--',
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '--',
      r.totalHours || '--',
      r.status
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Date', 'Check-In', 'Check-Out', 'Hours', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 242, 255], textColor: 255 },
    });

    doc.save(`Attendance_${user.empId}_${today}.pdf`);
  };

  const statusStyle = { Present: 'bg-green-500/10 text-green-400', Late: 'bg-yellow-500/10 text-yellow-400', 'Half Day': 'bg-red-500/10 text-red-400' };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {msg.text && <div className={`p-4 rounded-xl text-sm font-medium ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{msg.text}</div>}

      {/* Big Clock */}
      <div className="glass-card p-8 text-center">
        <div className="text-5xl font-bold mb-2" style={{ background: 'linear-gradient(135deg,#00f2ff,#bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 4 }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <p className="text-gray-400">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Employee', user?.name], ['ID', user?.empId], ['Status', todayRecord?.status || 'Not Checked In'], ['Location', location]].map(([label, val]) => (
          <div key={label} className="glass-card p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-sm font-semibold truncate">
              {label === 'Status' ? <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle[val] || 'bg-gray-500/10 text-gray-400'}`}>{val}</span> : val}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
        <button onClick={handleCheckIn} disabled={loading || !!todayRecord} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${todayRecord ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`} style={{ background: 'linear-gradient(135deg,#00ff88,#00c9ff)', color: '#05070a' }}>
          <LogIn size={24} /> Check In
        </button>
        <button onClick={handleCheckOut} disabled={loading || !todayRecord || !!todayRecord?.checkOut} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 ${(!todayRecord || todayRecord?.checkOut) ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`} style={{ background: 'linear-gradient(135deg,#ff3e3e,#ff8c00)' }}>
          <LogOut size={24} /> Check Out
        </button>
      </div>

      {/* Duration */}
      {todayRecord?.checkIn && !todayRecord.checkOut && (
        <div className="glass-card p-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Working Duration</p>
          <div className="text-4xl font-bold text-cyan-400" style={{ letterSpacing: 3 }}>{elapsed}</div>
          <div className="flex justify-center gap-8 mt-3 text-sm text-gray-400">
            <span>In: <strong className="text-white">{new Date(todayRecord.checkIn).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</strong></span>
            <span>Out: <strong className="text-white">--:--</strong></span>
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Clock size={18} className="text-cyan-400" /> Attendance History</h3>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-400 transition-colors">
            <Download size={14} /> Export PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-cyan-400 text-left border-b border-white/10">
              <th className="pb-3">Date</th><th className="pb-3">Check-In</th><th className="pb-3">Check-Out</th><th className="pb-3">Hours</th><th className="pb-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {records.map((r, i) => (
                <tr key={i} className="text-gray-300">
                  <td className="py-3">{r.date}</td>
                  <td className="py-3">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '--'}</td>
                  <td className="py-3">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '--'}</td>
                  <td className="py-3">{r.totalHours || 'In Progress'}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[r.status] || 'bg-gray-500/10 text-gray-400'}`}>{r.status}</span></td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-500">No records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
