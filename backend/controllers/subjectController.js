const Subject = require('../models/Subject');
const User = require('../models/User'); // Import User model

const getSubjects = async (req, res) => {
    try {
        let subjects;
        if (req.user.role === 'staff') {
            subjects = await Subject.find({ staffId: req.user._id });
        } else {
            // Find subjects where student is enrolled
            subjects = await Subject.find({ students: req.user._id });
        }
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSubject = async (req, res) => {
    const { name, code } = req.body;
    try {
        const subject = await Subject.create({
            name,
            code,
            staffId: req.user._id,
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add student to subject
const enrollStudent = async (req, res) => {
    const { subjectId, studentId, username } = req.body;
    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        if (subject.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let idToAdd = studentId;
        if (!idToAdd && username) {
            console.log(`Searching for student username: "${username}"`);
            // Case-insensitive search for username
            const user = await User.findOne({
                username: { $regex: new RegExp(`^${username}$`, 'i') }
            });

            if (!user) {
                console.log(`User not found for username: "${username}"`);
                return res.status(404).json({ message: `User '${username}' not found. Please ensure the student is registered.` });
            }
            if (user.role !== 'student') return res.status(400).json({ message: 'User is not a student' });
            idToAdd = user._id;
        }

        if (!idToAdd) return res.status(400).json({ message: 'Student ID or Username required' });

        if (!subject.students.includes(idToAdd)) {
            subject.students.push(idToAdd);
            await subject.save();
        }
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSubjects, createSubject, enrollStudent };
