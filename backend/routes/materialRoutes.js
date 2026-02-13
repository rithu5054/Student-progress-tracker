const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMaterials, addMaterial, deleteMaterial, getMaterialsBySubject } = require('../controllers/materialController');

router.get('/subject/:subjectId', protect, getMaterialsBySubject);
router.get('/:topicId', protect, getMaterials);
router.post('/', protect, authorize('staff'), addMaterial);
router.delete('/:id', protect, authorize('staff'), deleteMaterial);

module.exports = router;
