const express = require('express');
const router = express.Router();
const { getTests, getAllTests, getTest, createTest, updateTest, deleteTest, submitTest, getMyResults, getTestResults } = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTests);
router.get('/all', protect, authorize('teacher', 'admin'), getAllTests);
router.get('/my-results', protect, getMyResults);
router.get('/:id', protect, getTest);
router.post('/', protect, authorize('teacher', 'admin'), createTest);
router.put('/:id', protect, authorize('teacher', 'admin'), updateTest);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteTest);
router.post('/:id/submit', protect, submitTest);
router.get('/:id/results', protect, authorize('teacher', 'admin'), getTestResults);

module.exports = router;
