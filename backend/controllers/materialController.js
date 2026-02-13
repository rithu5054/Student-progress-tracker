const StudyMaterial = require('../models/StudyMaterial');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');

const getMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.find({ topicId: req.params.topicId });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addMaterial = async (req, res) => {
    const { topicId, title, type, url } = req.body;
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const subject = await Subject.findById(topic.subjectId);
        if (subject.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const material = await StudyMaterial.create({
            topicId,
            title,
            type,
            url,
        });
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        const topic = await Topic.findById(material.topicId);
        const subject = await Subject.findById(topic.subjectId);

        if (subject.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await material.deleteOne();
        res.json({ message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMaterialsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        // Get all topics for this subject
        const topics = await Topic.find({ subjectId });
        const topicIds = topics.map(t => t._id);

        // Get all materials for these topics
        const materials = await StudyMaterial.find({ topicId: { $in: topicIds } });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMaterials, addMaterial, deleteMaterial, getMaterialsBySubject };
