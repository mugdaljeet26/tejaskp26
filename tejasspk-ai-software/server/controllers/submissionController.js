const asyncHandler = require('express-async-handler');
const Submission = require('../models/Submission');
const User = require('../models/User');

// Helper to calculate target Friday deadline (3:30 PM) for any given submission date
const getWeekEndingFriday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (5 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(15, 30, 0, 0);
    
    // If submission is after Friday 3:30 PM, it belongs to the following Friday's cycle
    if (new Date(date) > d) {
        d.setDate(d.getDate() + 7);
    }
    return d;
};

// @desc    Submit PDF file for the week
// @route   POST /api/submissions
// @access  Private
const createSubmission = asyncHandler(async (req, res) => {
    const { pdfFile, pdfFileName } = req.body;

    if (!pdfFile || !pdfFileName) {
        res.status(400);
        throw new Error('Please provide a PDF (Report) file');
    }

    const now = new Date();
    const weekEnding = getWeekEndingFriday(now);

    // Create new submission
    const submission = await Submission.create({
        user: req.user._id,
        empName: req.user.fullName,
        empId: req.user.empId,
        pdfFile,
        pdfFileName,
        weekEnding,
        submittedAt: now
    });

    res.status(201).json({
        success: true,
        message: 'Weekly submission saved successfully!',
        submission
    });
});

// @desc    Get current employee's submission history
// @route   GET /api/submissions/my
// @access  Private
const getMySubmissions = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ user: req.user._id }).sort({ weekEnding: -1 });
    res.status(200).json({
        success: true,
        count: submissions.length,
        submissions
    });
});

// @desc    Get all employees' submissions (Admin only)
// @route   GET /api/submissions/all
// @access  Private/Admin
const getAllSubmissions = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({})
        .populate('user', 'fullName empId dept email photo phone parentPhone')
        .sort({ weekEnding: -1, submittedAt: -1 });

    res.status(200).json({
        success: true,
        count: submissions.length,
        submissions
    });
});

module.exports = {
    createSubmission,
    getMySubmissions,
    getAllSubmissions
};
