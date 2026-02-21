const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

// @route  GET /api/tasks/:id
// @desc   Get a single task by ID
// @access Private
router.get(
    '/:id',
    protect,
    [param('id').isMongoId().withMessage('Invalid task ID')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        try {
            const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found or not authorized' });
            }
            res.json({ success: true, task });
        } catch (error) {
            console.error('Get task error:', error);
            res.status(500).json({ success: false, message: 'Server error fetching task' });
        }
    }
);

// @route  GET /api/tasks
// @desc   Get all tasks for logged-in user (with optional search, status, priority filter)
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const { search, status, priority, sort } = req.query;
        const query = { user: req.user._id };

        if (status && ['todo', 'in-progress', 'done'].includes(status)) {
            query.status = status;
        }

        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            query.priority = priority;
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            az: { title: 1 },
            za: { title: -1 },
        };
        const sortBy = sortOptions[sort] || { createdAt: -1 };

        const tasks = await Task.find(query).sort(sortBy);

        res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tasks' });
    }
});

// @route  POST /api/tasks
// @desc   Create a new task
// @access Private
router.post(
    '/',
    protect,
    [
        body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
        body('description').optional().isLength({ max: 500 }),
        body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
        body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
        body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { title, description, status, priority, dueDate } = req.body;

        try {
            const task = await Task.create({
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                dueDate: dueDate || null,
                user: req.user._id,
            });

            res.status(201).json({ success: true, task });
        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({ success: false, message: 'Server error creating task' });
        }
    }
);

// @route  PUT /api/tasks/:id
// @desc   Update a task
// @access Private
router.put(
    '/:id',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid task ID'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 100 }),
        body('description').optional().isLength({ max: 500 }),
        body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
        body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
        body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found or not authorized' });
            }

            const { title, description, status, priority, dueDate } = req.body;
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (status !== undefined) task.status = status;
            if (priority !== undefined) task.priority = priority;
            if (dueDate !== undefined) task.dueDate = dueDate || null;

            await task.save();
            res.json({ success: true, task });
        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ success: false, message: 'Server error updating task' });
        }
    }
);

// @route  DELETE /api/tasks/:id
// @desc   Delete a task
// @access Private
router.delete(
    '/:id',
    protect,
    [param('id').isMongoId().withMessage('Invalid task ID')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found or not authorized' });
            }

            res.json({ success: true, message: 'Task deleted successfully' });
        } catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({ success: false, message: 'Server error deleting task' });
        }
    }
);

module.exports = router;
