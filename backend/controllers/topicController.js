const Topic = require('../models/Topic');
const Subject = require('../models/Subject');

const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find({ subjectId: req.params.subjectId });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTopic = async (req, res) => {
    const { name, subjectId } = req.body;
    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        if (subject.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add topics to this subject' });
        }

        const topic = await Topic.create({
            name,
            subjectId,
        });
        res.status(201).json(topic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const subject = await Subject.findById(topic.subjectId);
        if (subject.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await topic.deleteOne(); // or findByIdAndDelete
        res.json({ message: 'Topic removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTopics, createTopic, deleteTopic };
