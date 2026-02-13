const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getTopics, createTopic, deleteTopic } = require('../controllers/topicController');


// Helper route to get topics by subject
router.get('/subject/:subjectId', protect, getTopics);
router.get('/:subjectId', protect, getTopics);
router.post('/', protect, authorize('staff'), createTopic);
router.delete('/:id', protect, authorize('staff'), deleteTopic);

module.exports = router;
