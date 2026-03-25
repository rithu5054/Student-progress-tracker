const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    passingMarks: { type: Number, default: 70 },
    timeLimit: { type: Number, default: 30 }, // in minutes
    numQuestions: { type: Number, default: 25 }, // how many questions to ask per attempt
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);
