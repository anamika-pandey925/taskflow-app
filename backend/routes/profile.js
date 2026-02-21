const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route  GET /api/profile
// @desc   Get current user's profile
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
});

// @route  PUT /api/profile
// @desc   Update current user's profile (name, bio)
// @access Private
router.put(
    '/',
    protect,
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }),
        body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, bio } = req.body;
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;

        try {
            const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
                new: true,
                runValidators: true,
            });

            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ success: false, message: 'Server error updating profile' });
        }
    }
);

module.exports = router;
