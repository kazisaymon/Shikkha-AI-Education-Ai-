const express = require('express');
const router = express.Router();
const { getCourses, getAllCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses, addLesson, addClassMaterial, deleteClassMaterial } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/all', protect, authorize('admin'), getAllCourses);
router.get('/my-courses', protect, authorize('teacher', 'admin'), getMyCourses);
router.get('/:id', getCourse);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.post('/:id/lessons', protect, authorize('teacher', 'admin'), addLesson);
router.post('/:id/materials', protect, authorize('teacher', 'admin'), addClassMaterial);
router.delete('/:id/materials/:matId', protect, authorize('teacher', 'admin'), deleteClassMaterial);

module.exports = router;
