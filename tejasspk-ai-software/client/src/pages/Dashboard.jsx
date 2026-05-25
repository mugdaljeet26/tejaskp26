import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyAttendanceAPI, getAllAttendanceAPI } from '../api/axios';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Clock, Users, CheckCircle, ClipboardList } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = isAdmin ? await getAllAttendanceAPI() : await getMyAttendanceAPI();
        setRecords(res.data.records);
      } catch {}
    };
    fetch();
  }, [isAdmin]);

  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  const cards = [
    { label: 'Total Records', value: records.length, icon: ClipboardList, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Present Days', value: presentCount, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Late Days', value: lateCount, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Absent Days', value: absentCount, icon: Users, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  const doughnutData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [{ data: [presentCount, lateCount, absentCount], backgroundColor: ['#00f2ff', '#ffcc00', '#ff3e3e'], borderWidth: 0 }]
  };

  const last5 = records.slice(0, 5).reverse();
  const lineData = {
    labels: last5.map(r => r.date),
    datasets: [{ label: 'Hours', data: last5.map(r => { if (!r.totalHours) return 0; const [h,m] = r.totalHours.split(':'); return parseFloat(h) + parseFloat(m)/60; }), borderColor: '#bc13fe', backgroundColor: 'rgba(188,19,254,0.1)', fill: true, tension: 0.4, borderWidth: 2 }]
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0a0' } }, x: { grid: { display: false }, ticks: { color: '#a0a0a0' } } } };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-gray-400 text-sm mt-1">{user?.empId} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-5 hover:-translate-y-1 transition-transform duration-200">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-gray-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent records */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-cyan-400 border-b border-white/10">
              <th className="pb-3">Date</th><th className="pb-3">Check-In</th><th className="pb-3">Check-Out</th><th className="pb-3">Hours</th><th className="pb-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {records.slice(0, 8).map((r, i) => (
                <tr key={i} className="text-gray-300">
                  <td className="py-3">{r.date}</td>
                  <td className="py-3">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '--'}</td>
                  <td className="py-3">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '--'}</td>
                  <td className="py-3">{r.totalHours || 'In Progress'}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==='Present'?'bg-green-500/10 text-green-400':r.status==='Late'?'bg-yellow-500/10 text-yellow-400':'bg-red-500/10 text-red-400'}`}>{r.status}</span></td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-500">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
