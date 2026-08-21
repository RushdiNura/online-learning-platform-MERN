const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const course = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', course.getCourses);
router.get('/instructor/:id', course.getInstructorCourses);
router.get('/:id', course.getCourse);

router.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  validate,
  course.createCourse
);

router.put('/:id', protect, authorize('instructor', 'admin'), course.updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), course.deleteCourse);

router.post('/:id/lessons', protect, authorize('instructor', 'admin'), course.addLesson);
router.put('/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), course.updateLesson);
router.delete('/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), course.deleteLesson);

module.exports = router;
