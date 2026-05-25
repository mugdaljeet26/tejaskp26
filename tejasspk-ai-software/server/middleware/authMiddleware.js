const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tejasspk_jwt_super_secret_key_2026';

// Fallback admin object for when DB is unavailable
const FALLBACK_ADMIN = {
    _id: 'fallback-admin-id',
    fullName: 'System Admin',
    email: 'tejaskp@gmail.com',
    empId: 'TSPK-ADMIN',
    role: 'admin',
    dept: 'Management',
    photo: null
};

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            // If this is the fallback admin token (DB unavailable)
            if (decoded.id === 'fallback-admin-id') {
                req.user = FALLBACK_ADMIN;
                return next();
            }

            // Otherwise look up the user in DB (if connected)
            const dbConnected = mongoose.connection.readyState === 1;
            if (!dbConnected) {
                res.status(503);
                throw new Error('Database unavailable. Please try again shortly.');
            }

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }
            next();
        } catch (error) {
            if (error.message.includes('Database unavailable') || error.message.includes('User not found')) {
                throw error;
            }
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied: Admins only');
    }
});

module.exports = { protect, adminOnly };
