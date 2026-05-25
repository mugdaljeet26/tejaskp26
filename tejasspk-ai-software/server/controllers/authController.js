const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'tejasspk_jwt_super_secret_key_2026', { expiresIn: process.env.JWT_EXPIRE || '30d' });

// Hardcoded fallback admin (used ONLY when MongoDB is unavailable)
const FALLBACK_ADMIN = {
    email: 'tejaskp@gmail.com',
    password: 'tejas@1234',
    _id: 'fallback-admin-id',
    fullName: 'System Admin',
    empId: 'TSPK-ADMIN',
    role: 'admin',
    dept: 'Management',
    photo: null
};

// @desc    Register employee
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, dept, phone } = req.body;
    if (!fullName || !email || !password) {
        res.status(400); throw new Error('Please provide name, email and password');
    }
    const exists = await User.findOne({ email });
    if (exists) { res.status(400); throw new Error('User already exists'); }

    const user = await User.create({ fullName, email, password, dept, phone });
    res.status(201).json({
        success: true,
        _id: user._id, name: user.fullName, email: user.email,
        empId: user.empId, dept: user.dept, role: user.role, photo: user.photo,
        token: generateToken(user._id)
    });
});

// @desc    Login
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if MongoDB is connected
    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
        // Fallback: allow hardcoded admin login when DB is unavailable
        if (email === FALLBACK_ADMIN.email && password === FALLBACK_ADMIN.password) {
            return res.json({
                success: true,
                _id: FALLBACK_ADMIN._id,
                name: FALLBACK_ADMIN.fullName,
                email: FALLBACK_ADMIN.email,
                empId: FALLBACK_ADMIN.empId,
                dept: FALLBACK_ADMIN.dept,
                role: FALLBACK_ADMIN.role,
                photo: FALLBACK_ADMIN.photo,
                token: generateToken(FALLBACK_ADMIN._id)
            });
        }
        res.status(503);
        throw new Error('Database unavailable. Please try again shortly.');
    }

    // Normal DB login
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        res.status(401); throw new Error('Invalid email or password');
    }
    res.json({
        success: true,
        _id: user._id, name: user.fullName, email: user.email,
        empId: user.empId, dept: user.dept, role: user.role, photo: user.photo,
        token: generateToken(user._id)
    });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = { registerUser, loginUser, getMe };
