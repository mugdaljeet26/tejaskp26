import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const registerAPI   = (data) => API.post('/auth/register', data);
export const loginAPI      = (data) => API.post('/auth/login', data);
export const getMeAPI      = ()     => API.get('/auth/me');

// Employees
export const getEmployeesAPI  = ()         => API.get('/employees');
export const addEmployeeAPI   = (data)     => API.post('/employees', data);
export const updateEmployeeAPI= (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployeeAPI= (id)       => API.delete(`/employees/${id}`);
export const updateProfileAPI = (data)     => API.put('/employees/profile', data);

// Attendance
export const checkInAPI         = (data) => API.post('/attendance/checkin', data);
export const checkOutAPI        = ()     => API.post('/attendance/checkout');
export const getMyAttendanceAPI = ()     => API.get('/attendance/my');
export const getAllAttendanceAPI = ()     => API.get('/attendance/all');

// Leaves
export const applyLeaveAPI  = (data) => API.post('/leaves', data);
export const getMyLeavesAPI = ()     => API.get('/leaves/my');
export const getAllLeavesAPI = ()     => API.get('/leaves/all');
export const updateLeaveAPI = (id, data) => API.put(`/leaves/${id}`, data);

// Submissions
export const createSubmissionAPI = (data) => API.post('/submissions', data);
export const getMySubmissionsAPI  = ()     => API.get('/submissions/my');
export const getAllSubmissionsAPI = ()     => API.get('/submissions/all');

export default API;
