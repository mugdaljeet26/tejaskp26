const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

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
