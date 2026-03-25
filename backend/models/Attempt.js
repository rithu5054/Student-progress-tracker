const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    score: { type: Number, required: true },
    isPassed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
