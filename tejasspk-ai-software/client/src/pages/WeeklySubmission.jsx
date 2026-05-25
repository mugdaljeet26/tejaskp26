import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createSubmissionAPI, getMySubmissionsAPI } from '../api/axios';
import { Clock, Calendar, FileText, Upload, CheckCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function WeeklySubmission() {
  const { user } = useAuth();
  
  // File states
  const [pdf, setPdf] = useState({ name: 'No file chosen', base64: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // History logs
  const [history, setHistory] = useState([]);
  const [alreadySubmittedThisWeek, setAlreadySubmittedThisWeek] = useState(false);

  // Countdown states
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [nextDeadlineStr, setNextDeadlineStr] = useState('');
  const [currentWeekStr, setCurrentWeekStr] = useState('');

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Fetch submission history
  const fetchHistory = async () => {
    try {
      const res = await getMySubmissionsAPI();
      setHistory(res.data.submissions);
      
      // Calculate current week ending Friday to check if already submitted
      const now = new Date();
      const friday = getWeekEndingFriday(now);
      const fridayDateStr = friday.toDateString();
      
      const submitted = res.data.submissions.some(s => {
        return new Date(s.weekEnding).toDateString() === fridayDateStr;
      });
      setAlreadySubmittedThisWeek(submitted);
    } catch (err) {
      console.error('Failed to fetch submission history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    
    // Countdown Timer logic
    const interval = setInterval(() => {
      const now = new Date();
      const deadline = getWeekEndingFriday(now);
      
      const diff = deadline - now;
      if (diff <= 0) {
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });

      // Deadline String formatting
      const getOrdinal = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      };
      
      const dayName = deadline.toLocaleDateString('en-US', { weekday: 'long' });
      const monthName = deadline.toLocaleDateString('en-US', { month: 'long' });
      const dateNum = deadline.getDate();
      const yearNum = deadline.getFullYear();
      setNextDeadlineStr(`${dayName}, ${monthName} ${dateNum}${getOrdinal(dateNum)}, ${yearNum}`);

      // Set current week Sunday starting date
      const prevSunday = new Date(now);
      prevSunday.setDate(now.getDate() - now.getDay());
      setCurrentWeekStr(prevSunday.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper to calculate Friday deadline
  const getWeekEndingFriday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (5 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(15, 30, 0, 0);
    
    if (new Date(date) > d) {
      d.setDate(d.getDate() + 7);
    }
    return d;
  };

  // Base64 file reader helper
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setPdf({ name: file.name, base64: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // Form Submit Action
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdf.base64) {
      setMessage({ text: 'Please choose your PDF Report!', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      await createSubmissionAPI({
        pdfFile: pdf.base64,
        pdfFileName: pdf.name
      });
      
      setMessage({ text: 'Weekly report submitted successfully!', type: 'success' });
      setPdf({ name: 'No file chosen', base64: '' });
      fetchHistory();
      
      // Auto clear message after 4s
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Submission failed. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar render helpers
  const adjustMonth = (amount) => {
    const d = new Date(calendarDate);
    d.setMonth(d.getMonth() + amount);
    setCalendarDate(d);
  };

  const renderDays = () => {
    const now = new Date();
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty spacers
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    // Day elements
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const isFriday = dateObj.getDay() === 5;
      const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      
      let dayClasses = "aspect-square flex flex-col items-center justify-center text-xs font-semibold rounded-full relative cursor-default transition-all";
      if (isFriday) dayClasses += " bg-cyan-500/10 text-cyan-400";
      if (isToday) dayClasses += " border border-cyan-400 text-white font-bold";
      if (!isFriday && !isToday) dayClasses += " text-gray-400";

      days.push(
        <div key={`day-${day}`} className={dayClasses}>
          {day}
          {isFriday && <span className="w-1 h-1 bg-cyan-400 rounded-full absolute bottom-1.5 shadow-[0_0_8px_#00f2ff]"></span>}
        </div>
      );
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Weekly Document Submission</h2>
        <p className="text-gray-400 text-sm mt-1">Submit your work report (PDF) every Friday by 3:30 PM.</p>
      </div>

      {/* Top Details Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Countdown */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Deadline Remaining</div>
            <div className="text-lg font-bold text-gray-200 mt-0.5 font-mono flex gap-1">
              <span>{countdown.days}</span><span className="text-red-400 text-xs self-end mb-1">d</span> : 
              <span>{countdown.hours}</span><span className="text-red-400 text-xs self-end mb-1">h</span> : 
              <span>{countdown.minutes}</span><span className="text-red-400 text-xs self-end mb-1">m</span> : 
              <span>{countdown.seconds}</span><span className="text-red-400 text-xs self-end mb-1">s</span>
            </div>
          </div>
        </div>

        {/* Date Display */}
        <div className="glass-card p-5 flex items-center gap-4 lg:col-span-2 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Next Friday Deadline Date</div>
              <div className="text-base font-bold text-gray-200 mt-0.5">{nextDeadlineStr || 'Calculating...'}</div>
              <div className="text-xs text-gray-400">Time Limit: 03:30 PM</div>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold tracking-widest uppercase">High Priority</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <CheckCircle size={18} />
          {message.text}
        </div>
      )}

      {/* Main Widgets Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (Span 5) */}
        <div className="glass-card p-6 lg:col-span-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-gray-200">{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
            <div className="flex gap-1.5">
              <button onClick={() => adjustMonth(-1)} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><ChevronLeft size={18} /></button>
              <button onClick={() => adjustMonth(1)} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>

          {/* Weekdays Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-semibold mb-2">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 flex-1">
            {renderDays()}
          </div>

          {/* Legend */}
          <div className="border-t border-white/10 mt-6 pt-4 space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/20 border border-cyan-400 shadow-[0_0_8px_#00f2ff]"></span>
              <span>Submission Deadline Day (Fridays)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full border border-cyan-400"></span>
              <span>Current Date (Today)</span>
            </div>
          </div>
        </div>

        {/* Uploader Form Widget (Span 7) */}
        <div className="glass-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
              <h3 className="font-bold text-base text-gray-200">Current Week starting: {currentWeekStr}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${alreadySubmittedThisWeek ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                {alreadySubmittedThisWeek ? 'Submitted' : 'Pending Upload'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PDF report uploader */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Detailed Report (PDF)</label>
                <input type="file" id="pdfFileInput" accept=".pdf" className="hidden" onChange={handleFileChange} />
                <div onClick={() => document.getElementById('pdfFileInput').click()} className="border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-400/50 rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-all hover:bg-cyan-400 hover:text-[#000]">Choose File</span>
                  <span className="text-xs text-gray-400 truncate flex-1">{pdf.name}</span>
                  <FileText size={16} className="text-cyan-400" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !pdf.base64} className="w-full flex items-center justify-center gap-2 neon-btn text-white text-sm font-semibold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Submit Weekly Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* History Log Card */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-base text-gray-200 mb-4">Submission History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cyan-400 border-b border-white/10">
                <th className="pb-3">Week Ending Date</th>
                <th className="pb-3">Upload Timestamp</th>
                <th className="pb-3">PDF Work Report</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((s) => (
                <tr key={s._id} className="text-gray-300">
                  <td className="py-3 font-semibold text-gray-200">
                    {new Date(s.weekEnding).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="py-3 text-xs text-gray-400">
                    {new Date(s.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 text-xs">
                    <a href={s.pdfFile} download={s.pdfFileName} className="text-cyan-400 hover:underline flex items-center gap-1.5">
                      <FileText size={14} /> {s.pdfFileName}
                    </a>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">No submissions uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
