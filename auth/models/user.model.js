// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    preferences: {
        defaultTheme: String,
        favoriteCategories: [String],
        factDisplayPreferences: {
            fontSize: String,
            animationSpeed: String,
            autoPlay: Boolean
        },
        notifications: {
            dailyFact: Boolean,
            newCategories: Boolean
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    savedFacts: [{
        fact: String,
        category: String,
        savedAt: { type: Date, default: Date.now },
        notes: String  // Optional personal notes
    }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;