const express = require('express');
const router = express.Router();
const { getAssessment, submitAssessment, getAssessmentForStaff, createOrUpdateAssessment, getAssessmentsBySubject } = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Specific routes MUST come before the wildcard /:topicId
router.post('/submit', protect, submitAssessment);
router.post('/create', protect, authorize('staff'), createOrUpdateAssessment);
router.get('/subject/:subjectId', protect, authorize('staff'), getAssessmentsBySubject);
router.get('/staff/:topicId', protect, authorize('staff'), getAssessmentForStaff);

// Wildcard route - must be last
router.get('/:topicId', protect, getAssessment);

module.exports = router;
