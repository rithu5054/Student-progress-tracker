const Progress = require('../models/Progress');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const User = require('../models/User');

// Update or Create Progress (Student)
// Helper to check same day
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const updateProgress = async (req, res) => {
    const { topicId, completionPercentage, confidenceLevel } = req.body;
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const user = await User.findById(req.user._id);

        // --- Streak Logic ---
        const now = new Date();
        const last = new Date(user.lastActivity);

        if (!isSameDay(now, last)) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            if (isSameDay(last, yesterday)) {
                user.streak += 1;
            } else {
                user.streak = 1; // Reset if missed a day
            }
        }
        user.lastActivity = now;

        // --- Progress Update ---
        let progress = await Progress.findOne({ studentId: req.user._id, topicId });

        if (progress) {
            progress.completionPercentage = completionPercentage;
            progress.confidenceLevel = confidenceLevel;
        } else {
            progress = new Progress({
                studentId: req.user._id,
                topicId,
                completionPercentage,
                confidenceLevel,
                isUnlocked: true // If they are updating it, they must have access
            });
        }

        // --- Unlock Logic (Candy Crush Style) ---
        // Condition: >= 70% coverage AND High Confidence
        let unlockedNext = false;
        if (progress.completionPercentage >= 70 && progress.confidenceLevel === 'High') {
            // Find next topic in this subject
            // Get all topics for subject, sorted by order
            const topics = await Topic.find({ subjectId: topic.subjectId }).sort({ order: 1, createdAt: 1 });
            const currentIndex = topics.findIndex(t => t._id.toString() === topicId);

            if (currentIndex !== -1 && currentIndex < topics.length - 1) {
                const nextTopic = topics[currentIndex + 1];
                // Check if already unlocked
                const nextProgress = await Progress.findOne({ studentId: req.user._id, topicId: nextTopic._id });
                if (!nextProgress) {
                    await Progress.create({
                        studentId: req.user._id,
                        topicId: nextTopic._id,
                        isUnlocked: true
                    });
                    unlockedNext = true;
                } else if (!nextProgress.isUnlocked) {
                    nextProgress.isUnlocked = true;
                    await nextProgress.save();
                    unlockedNext = true;
                }
            }
        }

        // --- Badge Logic ---
        // "Topic Master": >= 80% coverage + High confidence
        const badgeName = "Topic Master";
        let newBadge = false;
        if (progress.completionPercentage >= 80 && progress.confidenceLevel === 'High') {
            if (!user.badges.includes(badgeName)) {
                user.badges.push(badgeName);
                newBadge = true;
            }
        }

        await progress.save();
        await user.save();

        res.json({
            progress,
            streak: user.streak,
            badges: user.badges,
            newBadge: newBadge ? badgeName : null,
            unlockedNext
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get progress for a specific subject (Student)
const getStudentSubjectProgress = async (req, res) => {
    const { subjectId } = req.params;
    try {
        const topics = await Topic.find({ subjectId });
        const topicIds = topics.map(t => t._id);

        const progress = await Progress.find({
            studentId: req.user._id,
            topicId: { $in: topicIds },
        });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get progress for all students in a subject (Staff)
const getSubjectProgressForStaff = async (req, res) => {
    const { subjectId } = req.params;
    try {
        const subject = await Subject.findById(subjectId).populate('students', 'name username');
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        if (subject.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const topics = await Topic.find({ subjectId });
        const topicIds = topics.map(t => t._id);

        // This is a heavy operation, optimizing might be needed for large data
        const studentProgressData = [];

        for (const student of subject.students) {
            const progressDocs = await Progress.find({
                studentId: student._id,
                topicId: { $in: topicIds },
            });

            // Calculate stats
            let totalCoverage = 0;
            let totalTopics = topics.length;
            let lowConfidenceCount = 0;

            progressDocs.forEach(p => {
                totalCoverage += p.completionPercentage;
                if (p.confidenceLevel === 'Low') lowConfidenceCount++;
            });

            const avgProgress = totalTopics > 0 ? (totalCoverage / (totalTopics * 100)) * 100 : 0; // Normalized to 0-100?
            // Wait, completionPercentage is 0-100.
            // So avg = sum(completion) / count.
            const avgCoverage = totalTopics > 0 ? totalCoverage / totalTopics : 0;

            studentProgressData.push({
                studentId: student._id,
                name: student.name,
                avgCoverage: avgCoverage.toFixed(2),
                progressDocs,
            });
        }

        res.json(studentProgressData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get Student Dashboard Stats (Streak, Health, Badges, Weak Areas)
const getDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // 1. Calculate Academic Health
        // Get all subjects student is enrolled in
        const subjects = await Subject.find({ students: req.user._id });
        let totalSubjectScore = 0;
        let subjectcount = 0;

        for (const sub of subjects) {
            const topics = await Topic.find({ subjectId: sub._id });
            if (topics.length === 0) continue;

            const progressDocs = await Progress.find({
                studentId: req.user._id,
                topicId: { $in: topics.map(t => t._id) }
            });

            let subTotal = 0;
            progressDocs.forEach(p => subTotal += p.completionPercentage);
            // Average for this subject
            // If topic has no progress, assume 0
            const subAvg = subTotal / topics.length;
            totalSubjectScore += subAvg;
            subjectcount++;
        }

        const academicHealth = subjectcount > 0 ? Math.round(totalSubjectScore / subjectcount) : 0;

        // 2. Weak Areas
        const weakProgress = await Progress.find({
            studentId: req.user._id,
            $or: [
                { completionPercentage: { $lt: 40 } },
                { confidenceLevel: 'Low' }
            ]
        }).populate('topicId'); // populate topic to get name

        const weakAreas = weakProgress.map(p => ({
            topic: p.topicId.name,
            reason: p.completionPercentage < 40 ? 'Low Coverage' : 'Low Confidence'
        }));

        res.json({
            streak: user.streak,
            badges: user.badges,
            academicHealth,
            weakAreas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateProgress, getStudentSubjectProgress, getSubjectProgressForStaff, getDashboardStats };
