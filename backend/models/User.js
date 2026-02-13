const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['staff', 'student'], required: true },
    badges: [{ type: String }], // Array of badge names
    streak: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
    xp: { type: Number, default: 0 }, // Experience points for gamification
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
