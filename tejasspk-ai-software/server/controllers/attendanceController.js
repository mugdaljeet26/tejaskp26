const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');

const todayStr = () => new Date().toISOString().split('T')[0];

const calcStatus = (checkInTime) => {
    const h = checkInTime.getHours();
    const m = checkInTime.getMinutes();
    const total = h * 60 + m;
    if (total <= 9 * 60) return 'Present';
    if (total <= 10 * 60 + 30) return 'Late';
    return 'Half Day';
};

// @route POST /api/attendance/checkin
const checkIn = asyncHandler(async (req, res) => {
    const { location } = req.body;
    const date = todayStr();
    const existing = await Attendance.findOne({ employee: req.user._id, date });
    if (existing) { res.status(400); throw new Error('Already checked in today'); }

    const now = new Date();
    const record = await Attendance.create({
        employee: req.user._id, empId: req.user.empId,
        empName: req.user.fullName, date,
        checkIn: now, status: calcStatus(now), location: location || 'N/A'
    });
    res.status(201).json({ success: true, record });
});

// @route POST /api/attendance/checkout
const checkOut = asyncHandler(async (req, res) => {
    const date = todayStr();
    const record = await Attendance.findOne({ employee: req.user._id, date });
    if (!record) { res.status(404); throw new Error('No check-in found for today'); }
    if (record.checkOut) { res.status(400); throw new Error('Already checked out'); }

    const now = new Date();
    const elapsed = now - record.checkIn;
    const hrs = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');

    record.checkOut = now;
    record.totalHours = `${hrs}:${mins}:${secs}`;
    await record.save();
    res.json({ success: true, record });
});

// @route GET /api/attendance/my
const getMyAttendance = asyncHandler(async (req, res) => {
    const records = await Attendance.find({ employee: req.user._id }).sort({ date: -1 });
    res.json({ success: true, records });
});

// @route GET /api/attendance/all  (admin)
const getAllAttendance = asyncHandler(async (req, res) => {
    const records = await Attendance.find({}).populate('employee', 'fullName empId dept').sort({ date: -1 });
    res.json({ success: true, records });
});

// @desc    Get attendance of a specific employee
// @route   GET /api/attendance/employee/:empId
// @access  Private/Admin
const getEmployeeAttendance = asyncHandler(async (req, res) => {
    const records = await Attendance.find({ empId: req.params.empId }).sort({ date: -1 });
    res.json({ success: true, records });
});

// @desc    Update attendance status by ID
// @route   PUT /api/attendance/:id
// @access  Private/Admin
const updateAttendanceStatus = asyncHandler(async (req, res) => {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
        res.status(404);
        throw new Error('Attendance record not found');
    }

    const { status, checkIn, checkOut, totalHours } = req.body;
    if (status) record.status = status;
    if (checkIn !== undefined) record.checkIn = checkIn;
    if (checkOut !== undefined) record.checkOut = checkOut;
    if (totalHours !== undefined) record.totalHours = totalHours;

    await record.save();
    res.json({ success: true, record });
});

module.exports = {
    checkIn,
    checkOut,
    getMyAttendance,
    getAllAttendance,
    getEmployeeAttendance,
    updateAttendanceStatus
};
