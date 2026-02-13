const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSubjects, createSubject, enrollStudent } = require('../controllers/subjectController');

router.route('/').get(protect, getSubjects).post(protect, authorize('staff'), createSubject);
router.route('/enroll').post(protect, authorize('staff'), enrollStudent);

module.exports = router;
