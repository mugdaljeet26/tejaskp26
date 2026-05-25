const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Send a notification
// @route   POST /api/notifications
// @access  Private/Admin
const sendNotification = asyncHandler(async (req, res) => {
    const { to, subject, message } = req.body;
    if (!subject || !message) {
        res.status(400);
        throw new Error('Subject and message are required');
    }

    const notification = await Notification.create({
        to: to || 'all',
        subject,
        message,
        sender: req.user._id
    });

    res.status(201).json({ success: true, notification });
});

// @desc    Get all notifications (admin history)
// @route   GET /api/notifications/all
// @access  Private/Admin
const getAllNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({})
        .populate('sender', 'fullName email')
        .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
});

// @desc    Get my notifications
// @route   GET /api/notifications/my
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        $or: [
            { to: 'all' },
            { to: req.user.email }
        ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
});

module.exports = {
    sendNotification,
    getAllNotifications,
    getMyNotifications
};
