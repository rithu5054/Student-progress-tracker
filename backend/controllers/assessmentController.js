const Assessment = require('../models/Assessment');
const Attempt = require('../models/Attempt');
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');

// Fetch assessment for a topic
const getAssessment = async (req, res) => {
    try {
        const { topicId } = req.params;
        const assessment = await Assessment.findOne({ topicId });
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        // Select random questions
        let allQuestions = [...assessment.questions];
        allQuestions.sort(() => 0.5 - Math.random());
        const numToSelect = Math.min(assessment.numQuestions || 5, allQuestions.length);
        const selectedQuestions = allQuestions.slice(0, numToSelect);

        // Strip correct answers to prevent cheating and shuffle options
        const questionsToSend = selectedQuestions.map(q => {
            const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
            return {
                _id: q._id,
                question: q.question,
                options: shuffledOptions
            };
        });

        res.json({
            _id: assessment._id,
            topicId: assessment.topicId,
            passingMarks: assessment.passingMarks,
            timeLimit: assessment.timeLimit || 5,
            questions: questionsToSend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit assessment and evaluate
const submitAssessment = async (req, res) => {
    try {
        const { topicId, answers, questionIds } = req.body;
        // answers format: { questionId1: 'optionA', questionId2: 'optionB' }
        const assessment = await Assessment.findOne({ topicId });
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        let correctCount = 0;
        const totalAsked = questionIds && questionIds.length > 0 ? questionIds.length : assessment.questions.length;
        
        assessment.questions.forEach(q => {
            if ((!questionIds || questionIds.includes(q._id.toString())) && answers[q._id.toString()] && answers[q._id.toString()] === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = totalAsked > 0 ? (correctCount / totalAsked) * 100 : 0;
        const isPassed = score >= assessment.passingMarks;

        // Create attempt
        const attempt = await Attempt.create({
            studentId: req.user._id,
            topicId,
            score,
            isPassed
        });

        let nextTopicUnlocked = false;

        // Update progress
        let progress = await Progress.findOne({ studentId: req.user._id, topicId });
        if (progress) {
            progress.assessmentScore = Math.max(progress.assessmentScore || 0, score);
            if (isPassed && !progress.assessmentPassed) {
                progress.assessmentPassed = true;
                await progress.save();

                // Unlock next topic
                const topic = await Topic.findById(topicId);
                const topics = await Topic.find({ subjectId: topic.subjectId }).sort({ order: 1, createdAt: 1 });
                const currentIndex = topics.findIndex(t => t._id.toString() === topicId);

                if (currentIndex !== -1 && currentIndex < topics.length - 1) {
                    const nextTopic = topics[currentIndex + 1];
                    let nextProgress = await Progress.findOne({ studentId: req.user._id, topicId: nextTopic._id });
                    if (!nextProgress) {
                        await Progress.create({
                            studentId: req.user._id,
                            topicId: nextTopic._id,
                            isUnlocked: true
                        });
                        nextTopicUnlocked = true;
                    } else if (!nextProgress.isUnlocked) {
                        nextProgress.isUnlocked = true;
                        await nextProgress.save();
                        nextTopicUnlocked = true;
                    }
                }
            } else {
                await progress.save();
            }
        }

        res.json({
            score,
            isPassed,
            nextTopicUnlocked,
            attemptId: attempt._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// --- Staff Endpoints ---

// Get full assessment (with correct answers) for staff to edit
const getAssessmentForStaff = async (req, res) => {
    try {
        const { topicId } = req.params;
        const assessment = await Assessment.findOne({ topicId });
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or Update assessment
const createOrUpdateAssessment = async (req, res) => {
    try {
        const { topicId, passingMarks, timeLimit, numQuestions, questions } = req.body;
        
        let assessment = await Assessment.findOne({ topicId });
        
        if (assessment) {
            assessment.passingMarks = passingMarks;
            assessment.timeLimit = timeLimit;
            assessment.numQuestions = numQuestions;
            assessment.questions = questions;
            await assessment.save();
        } else {
            assessment = await Assessment.create({
                topicId,
                passingMarks,
                timeLimit,
                numQuestions,
                questions
            });
        }
        
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAssessmentsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const topics = await Topic.find({ subjectId });
        const topicIds = topics.map(t => t._id);
        
        const assessments = await Assessment.find({ topicId: { $in: topicIds } }, 'topicId');
        const assessmentTopicIds = assessments.map(a => a.topicId.toString());
        
        res.json({ assessmentTopicIds });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAssessment, submitAssessment, getAssessmentForStaff, createOrUpdateAssessment, getAssessmentsBySubject };
