const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            createdAt: user.createdAt,
        },
    });
};

// @route  POST /api/auth/register
// @desc   Register a new user
// @access Public
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
        body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ success: false, message: 'Email already registered' });
            }

            const user = await User.create({ name, email, password });
            sendTokenResponse(user, 201, res);
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ success: false, message: 'Server error during registration' });
        }
    }
);

// @route  POST /api/auth/login
// @desc   Login user and return JWT
// @access Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            sendTokenResponse(user, 200, res);
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server error during login' });
        }
    }
);

module.exports = router;
