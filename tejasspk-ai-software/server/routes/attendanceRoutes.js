const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getAllAttendance, getEmployeeAttendance, updateAttendanceStatus } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/all', protect, adminOnly, getAllAttendance);
router.get('/employee/:empId', protect, adminOnly, getEmployeeAttendance);
router.put('/:id', protect, adminOnly, updateAttendanceStatus);

module.exports = router;
