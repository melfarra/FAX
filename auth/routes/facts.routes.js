const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const User = require('../models/user.model');

// Protect all routes
router.use(authMiddleware.protect);

// Save a fact
router.post('/save', async (req, res) => {
    try {
        const { fact, category } = req.body;
        const user = await User.findById(req.user._id);

        user.savedFacts.push({
            fact,
            category,
            savedAt: new Date()
        });

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Fact saved successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get all saved facts
router.get('/saved', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            status: 'success',
            facts: user.savedFacts
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Delete a saved fact
router.delete('/saved/:id', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedFacts = user.savedFacts.filter(
            fact => fact._id.toString() !== req.params.id
        );
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Fact deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router; 