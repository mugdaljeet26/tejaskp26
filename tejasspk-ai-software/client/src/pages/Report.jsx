import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Bell } from 'lucide-react';

export default function Report() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      // Filter notifications sent to 'all' or the logged in user's email
      const myNotifs = allNotifs.filter(
        (n) => n.to === 'all' || (user && n.to === user.email)
      );
      // Sort notifications by time descending (newest first)
      myNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(myNotifs);
    };

    loadNotifications();
    // Poll for changes or add event listener for localStorage if needed, 
    // but a simple load on mount is usually sufficient.
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Notifications</h2>
        <p className="text-gray-400 text-sm mt-1">Important updates and messages from the Administration</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500 flex flex-col items-center justify-center border border-white/5">
            <Bell size={48} className="text-gray-600 mb-3" />
            <h3 className="font-semibold text-lg text-gray-300">No new notifications</h3>
            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const date = new Date(n.time);
            const isAll = n.to === 'all';
            return (
              <div
                key={i}
                className="glass-card p-6 hover:-translate-y-0.5 transition-all duration-300 border border-white/5 hover:border-cyan-500/30 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Mail size={18} className="text-cyan-400" />
                    <h4 className="font-bold text-gray-200 text-base">{n.subject}</h4>
                    {isAll ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-extrabold text-[10px] tracking-wide uppercase border border-cyan-500/20">
                        Broadcast
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-extrabold text-[10px] tracking-wide uppercase border border-purple-500/20">
                        Direct
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    <Calendar size={12} />
                    {date.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed border-t border-white/5 pt-3">
                  {n.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
