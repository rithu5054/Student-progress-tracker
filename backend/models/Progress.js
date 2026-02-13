const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    confidenceLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    isUnlocked: { type: Boolean, default: false }, // If true, student can access this topic
    assessmentScore: { type: Number, default: null }, // Score in %
    isCertified: { type: Boolean, default: false }, // Badge earned for this topic
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
