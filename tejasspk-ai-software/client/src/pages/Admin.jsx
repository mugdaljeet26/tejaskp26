import React, { useEffect, useState } from 'react';
import {
  getEmployeesAPI,
  addEmployeeAPI,
  updateEmployeeAPI,
  deleteEmployeeAPI,
  getAllLeavesAPI,
  updateLeaveAPI,
  getAllAttendanceAPI,
  getAllSubmissionsAPI
} from '../api/axios';
import { UserPlus, Trash2, Check, X, Phone, Users, Shield, FileText, Calendar, Edit, Download } from 'lucide-react';

const DEPTS = ['ai-ml', 'web-development', 'ai-research', 'engineering', 'data-science', 'product', 'design'];
const DEPT_LABEL = {
  'ai-ml': 'AI/ML',
  'web-development': 'Web Dev',
  'ai-research': 'AI Research',
  'engineering': 'Engineering',
  'data-science': 'Data Science',
  'product': 'Product',
  'design': 'Design'
};

export default function Admin() {
  const [tab, setTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const [notifTo, setNotifTo] = useState('all');
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifHistory, setNotifHistory] = useState([]);

  const loadNotifHistory = () => {
    const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    setNotifHistory(notifs);
  };

  const handleSendNotif = (e) => {
    e.preventDefault();
    if (!notifSubject.trim() || !notifMsg.trim()) {
      showMsg('Subject and Message are required.');
      return;
    }
    const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const newNotif = {
      to: notifTo,
      subject: notifSubject.trim(),
      message: notifMsg.trim(),
      time: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    localStorage.setItem('admin_notifications', JSON.stringify(notifs));
    setNotifSubject('');
    setNotifMsg('');
    loadNotifHistory();
    showMsg('Notification sent successfully!');
  };

  // Forms & Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    dept: 'engineering',
    role: 'employee',
    phone: '',
    parentPhone: ''
  });
  
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    try {
      const r = await getEmployeesAPI();
      setEmployees(r.data.employees);
    } catch {}
    try {
      const r = await getAllLeavesAPI();
      setLeaves(r.data.leaves);
    } catch {}
    try {
      const r = await getAllAttendanceAPI();
      setAttendance(r.data.records);
    } catch {}
    try {
      const r = await getAllSubmissionsAPI();
      setSubmissions(r.data.submissions);
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    loadNotifHistory();
  }, []);

  const showMsg = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      fullName: '',
      email: '',
      password: '',
      dept: 'engineering',
      role: 'employee',
      phone: '',
      parentPhone: ''
    });
    setShowForm(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingId(emp._id);
    setForm({
      fullName: emp.fullName,
      email: emp.email,
      password: '', // Leave blank if not changing
      dept: emp.dept || 'engineering',
      role: emp.role || 'employee',
      phone: emp.phone || '',
      parentPhone: emp.parentPhone || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Edit flow
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password; // Do not update password if left blank
        await updateEmployeeAPI(editingId, updateData);
        showMsg('Employee details updated successfully!');
      } else {
        // Add flow
        await addEmployeeAPI(form);
        showMsg('New employee added successfully!');
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee permanently?')) return;
    try {
      await deleteEmployeeAPI(id);
      showMsg('Employee removed successfully!');
      fetchAll();
    } catch {}
  };

  const handleLeave = async (id, status) => {
    try {
      await updateLeaveAPI(id, { status });
      showMsg(`Leave request ${status.toLowerCase()}!`);
      fetchAll();
    } catch {}
  };

  const tabs = ['employees', 'submissions', 'attendance', 'leaves', 'notifications'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🛡️ Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">Manage system configurations, employees, and submissions</p>
        </div>
        {msg && <div className="glass-card px-4 py-2 text-green-400 text-sm border border-green-500/20 shadow-md animate-pulse">{msg}</div>}
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              tab === t ? 'text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            style={tab === t ? { background: 'linear-gradient(135deg,#00f2ff,#bc13fe)' } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB: EMPLOYEES (Converted into Box Grid Layout) */}
      {tab === 'employees' && (
        <div className="space-y-5">
          <div className="glass-card p-5 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-gray-200">Registered Employees ({employees.length})</h3>
              <p className="text-xs text-gray-500 mt-0.5">Dual-contact verification and box layout design</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg,#00f2ff,#bc13fe)' }}
            >
              <UserPlus size={16} /> Add Employee
            </button>
          </div>

          {/* Form Modal/Drawer Area */}
          {showForm && (
            <div className="glass-card p-6 border-cyan-500/20 bg-white/[0.02]">
              <h3 className="font-bold text-base mb-4 text-cyan-400">
                {editingId ? '✏️ Edit Employee Details' : '➕ Register New Employee'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Full Name *</label>
                  <input
                    className="input-field"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="email@gamil.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Password {editingId && '(Leave blank to keep)'} *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder={editingId ? '••••••' : 'Password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingId}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Department *</label>
                  <select
                    className="input-field"
                    value={form.dept}
                    onChange={(e) => setForm({ ...form, dept: e.target.value })}
                  >
                    {DEPTS.map((d) => (
                      <option key={d} value={d} className="bg-[#0b0f19] text-white">
                        {DEPT_LABEL[d]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Employee Contact *</label>
                  <input
                    className="input-field"
                    placeholder="Employee Contact Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Parent Contact *</label>
                  <input
                    className="input-field"
                    placeholder="Parent Contact Number"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-gray-400 font-semibold">System Permission Role *</label>
                  <select
                    className="input-field"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="employee" className="bg-[#0b0f19] text-white">
                      Standard Employee Portal Access
                    </option>
                    <option value="admin" className="bg-[#0b0f19] text-white">
                      Full Administrator Security Credentials
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2 flex gap-3 mt-2">
                  <button type="submit" className="neon-btn text-white text-xs py-3 px-6 shadow-md flex-1">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BOX CARDS GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {employees.map((e) => (
              <div
                key={e._id}
                className="glass-card p-5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border-white/5 hover:border-cyan-500/30"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-500/40 flex items-center justify-center bg-white/5 shadow-inner">
                      {e.photo ? (
                        <img src={e.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-cyan-400">{e.fullName?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200 text-sm leading-snug">{e.fullName}</h4>
                      <div className="text-[10px] text-cyan-400 font-mono tracking-wider">{e.empId || 'TSPK-MEMBER'}</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-400 border-t border-white/5 pt-3.5 mb-4">
                    <div className="flex justify-between items-center">
                      <span>Department:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-[10px] tracking-wide uppercase">
                        {DEPT_LABEL[e.dept] || e.dept}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Access Role:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                          e.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {e.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Employee Contact:</span>
                      <span className="text-gray-200 font-medium font-mono">{e.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Parent Contact:</span>
                      <span className="text-gray-200 font-medium font-mono">{e.parentPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-white/5 pt-3 mt-1">
                  <button
                    onClick={() => handleOpenEdit(e)}
                    className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:scale-105 transition-all"
                    title="Edit Details"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all"
                    title="Delete Account"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 glass-card">
                <Users className="mx-auto text-gray-600 mb-3" size={32} />
                No employee records found in system database.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SUBMISSIONS (Admin receives files with Employee Name & ID) */}
      {tab === 'submissions' && (
        <div className="glass-card p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-200">Weekly Submission Audit Panel</h3>
            <p className="text-xs text-gray-500 mt-0.5">Admin console receiving employee work reports</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cyan-400 border-b border-white/10">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Week Ending Friday</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Detailed PDF Report</th>
                  <th className="pb-3">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((s) => (
                  <tr key={s._id} className="text-gray-300">
                    <td className="py-3.5">
                      <div className="font-bold text-gray-200">{s.empName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono tracking-wide">{s.empId}</div>
                    </td>
                    <td className="py-3.5 text-xs font-semibold text-purple-400 uppercase">
                      {DEPT_LABEL[s.user?.dept] || s.user?.dept || 'Engineering'}
                    </td>
                    <td className="py-3.5 text-xs text-gray-200 font-semibold">
                      {new Date(s.weekEnding).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 text-xs text-gray-400 font-mono">
                      {new Date(s.submittedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 text-xs">
                      {s.pdfFile ? (
                        <a href={s.pdfFile} download={s.pdfFileName} className="text-cyan-400 hover:underline flex items-center gap-1.5 font-medium">
                          <FileText size={14} /> Download PDF
                        </a>
                      ) : (
                        <span className="text-gray-600">No PDF uploaded</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-extrabold uppercase tracking-wide border border-green-500/20">
                        Received
                      </span>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                      No weekly submissions received from employees yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE */}
      {tab === 'attendance' && (
        <div className="glass-card p-5">
          <h3 className="font-bold text-base mb-4 text-gray-200">Check-In / Check-Out Monitoring</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cyan-400 border-b border-white/10">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">In</th>
                  <th className="pb-3">Out</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attendance.map((r, i) => (
                  <tr key={i} className="text-gray-300">
                    <td className="py-3">
                      <div className="font-medium text-white">{r.empName}</div>
                      <div className="text-[10px] text-gray-500">{r.empId}</div>
                    </td>
                    <td className="py-3">{r.date}</td>
                    <td className="py-3 text-green-400">
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                    <td className="py-3 text-red-400">
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                    <td className="py-3">{r.totalHours || 'Active'}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'Present'
                            ? 'bg-green-500/10 text-green-400'
                            : r.status === 'Late'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No attendance data monitored today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LEAVES */}
      {tab === 'leaves' && (
        <div className="glass-card p-5">
          <h3 className="font-bold text-base mb-4 text-gray-200">Leave Requests Management</h3>
          <div className="space-y-3">
            {leaves.map((l) => (
              <div
                key={l._id}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border-l-4"
                style={{ borderLeftColor: l.status === 'Approved' ? '#00ff88' : l.status === 'Rejected' ? '#ff3e3e' : '#ffcc00' }}
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-200">{l.empName}</div>
                  <div className="text-xs text-gray-400">
                    {l.leaveType} · {new Date(l.fromDate).toLocaleDateString()} – {new Date(l.toDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{l.reason}</div>
                </div>
                {l.status === 'Pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLeave(l._id, 'Approved')}
                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleLeave(l._id, 'Rejected')}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      l.status === 'Approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {l.status}
                  </span>
                )}
              </div>
            ))}
            {leaves.length === 0 && <p className="text-center text-gray-500 py-8">No leave requests.</p>}
          </div>
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div className="glass-card p-5 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-bold text-base text-gray-200">Send Notification</h3>
            <p className="text-xs text-gray-500 mt-0.5">Broadcast messages to all employees or send to a specific person</p>
          </div>
          <form onSubmit={handleSendNotif} className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">To</label>
              <select
                className="input-field"
                value={notifTo}
                onChange={(e) => setNotifTo(e.target.value)}
              >
                <option value="all" className="bg-[#0b0f19] text-white">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.email} className="bg-[#0b0f19] text-white">
                    {emp.fullName} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Subject</label>
              <input
                className="input-field"
                placeholder="Notification subject..."
                value={notifSubject}
                onChange={(e) => setNotifSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Message</label>
              <textarea
                className="input-field min-h-[120px] py-3"
                placeholder="Write your message here..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="neon-btn text-white text-xs py-3 px-6 shadow-md max-w-xs">
              Send Notification
            </button>
          </form>

          <hr className="border-white/5 my-6" />

          <div>
            <h3 className="font-bold text-base text-gray-200 mb-4">Sent History</h3>
            <div className="space-y-3">
              {notifHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No notifications sent yet.</p>
              ) : (
                notifHistory.map((n, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-200">{n.subject}</h4>
                      <p className="text-xs text-gray-400">
                        To: <span className="text-cyan-400 font-mono">{n.to}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{n.message.substring(0, 100)}{n.message.length > 100 && '...'}</p>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono md:text-right shrink-0">
                      {new Date(n.time).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
