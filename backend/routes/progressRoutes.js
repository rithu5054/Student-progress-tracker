const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { updateProgress, getStudentSubjectProgress, getSubjectProgressForStaff, getDashboardStats } = require('../controllers/progressController');

router.get('/stats', protect, getDashboardStats);
router.post('/', protect, updateProgress);
router.get('/student/:subjectId', protect, getStudentSubjectProgress);
router.get('/staff/:subjectId', protect, authorize('staff'), getSubjectProgressForStaff);

module.exports = router;
