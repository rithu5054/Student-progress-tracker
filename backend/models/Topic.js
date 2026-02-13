const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    order: { type: Number, default: 0 }, // For sequencing in roadmap
    description: { type: String }, // Brief description for the node
    isAssessmentAvailable: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);
