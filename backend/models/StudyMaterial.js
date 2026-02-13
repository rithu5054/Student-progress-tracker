const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'link'], required: true },
    url: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
