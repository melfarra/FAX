const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            preferences: req.body.preferences || {}
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
        }

        // Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
        }

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.googleAuth = async (req, res) => {
    try {
        // Handle the user data coming from Google OAuth
        const { googleId, email, name } = req.body;

        // Check if user already exists
        let user = await User.findOne({ googleId });
        
        if (!user) {
            // If user doesn't exist, create new user
            user = await User.create({
                googleId,
                email,
                name,
                password: Math.random().toString(36).slice(-8) // Generate random password for Google users
            });
        }

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { preferences: req.body.preferences },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
