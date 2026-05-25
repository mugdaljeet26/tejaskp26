const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Apply for leave
router.post('/', protect, asyncHandler(async (req, res) => {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const leave = await Leave.create({ employee: req.user._id, empId: req.user.empId, empName: req.user.fullName, leaveType, fromDate, toDate, reason });
    res.status(201).json({ success: true, leave });
}));

// Get my leaves
router.get('/my', protect, asyncHandler(async (req, res) => {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
}));

// Get all leaves (admin)
router.get('/all', protect, adminOnly, asyncHandler(async (req, res) => {
    const leaves = await Leave.find({}).populate('employee', 'fullName empId dept').sort({ createdAt: -1 });
    res.json({ success: true, leaves });
}));

// Approve/Reject leave (admin)
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const leave = await Leave.findById(req.params.id);
    if (!leave) { res.status(404); throw new Error('Leave not found'); }
    leave.status = req.body.status;
    leave.approvedBy = req.user._id;
    await leave.save();
    res.json({ success: true, leave });
}));

module.exports = router;
