import React, { useState, useEffect } from 'react';
import { getMyAttendanceAPI } from '../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar() {
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);

  useEffect(() => { getMyAttendanceAPI().then(r => setRecords(r.data.records)).catch(() => {}); }, []);

  const year = date.getFullYear(), month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const getStatus = (day) => {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return records.find(r => r.date === ds)?.status || null;
  };

  const statusColor = { Present: 'bg-green-500/20 text-green-400 border-green-500/30', Late: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 'Half Day': 'bg-red-500/20 text-red-400 border-red-500/30', Absent: 'bg-red-800/20 text-red-600 border-red-800/30' };

  const monthRecords = records.filter(r => r.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));
  const present = monthRecords.filter(r => r.status === 'Present').length;
  const late = monthRecords.filter(r => r.status === 'Late').length;
  const workDays = monthRecords.filter(r => !['Absent','Leave'].includes(r.status)).length;
  const pct = monthRecords.length ? Math.round((workDays / monthRecords.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['Present', present, 'text-green-400'], ['Late', late, 'text-yellow-400'], ['Absent', monthRecords.length - workDays, 'text-red-400'], ['Attendance %', pct + '%', 'text-cyan-400']].map(([l, v, c]) => (
          <div key={l} className="glass-card p-4 text-center"><div className={`text-2xl font-bold ${c}`}>{v}</div><div className="text-gray-400 text-sm mt-1">{l}</div></div>
        ))}
      </div>

      {/* Calendar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setDate(new Date(year, month-1))} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><ChevronLeft size={18} /></button>
          <h3 className="font-bold text-lg">{MONTHS[month]} {year}</h3>
          <button onClick={() => setDate(new Date(year, month+1))} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs text-cyan-400 font-semibold py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={'e'+i} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const status = getStatus(day);
            const isToday = ds === today;
            const isWeekend = [0,6].includes(new Date(year, month, day).getDay());
            return (
              <div key={day} className={`aspect-square rounded-xl flex flex-col items-center justify-center border text-sm font-semibold transition-all duration-200 ${isToday ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : isWeekend ? 'border-white/5 opacity-40' : status ? `border ${statusColor[status]}` : 'border-white/5'}`} style={isToday ? { boxShadow: '0 0 12px rgba(0,242,255,0.2)' } : {}}>
                <span>{day}</span>
                {status && <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: status==='Present'?'#00ff88':status==='Late'?'#ffcc00':'#ff3e3e' }} />}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {[['Present','#00ff88'],['Late','#ffcc00'],['Absent','#ff3e3e'],['Today','#00f2ff']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full" style={{ background: c }} />{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
