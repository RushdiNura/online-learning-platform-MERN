const express = require('express');
const router = express.Router();
const enrollment = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, enrollment.enrollInCourse);
router.get('/user/:userId', protect, enrollment.getUserEnrollments);
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), enrollment.getCourseEnrollments);
router.put('/:id/progress', protect, enrollment.updateEnrollmentProgress);
router.delete('/:id', protect, enrollment.unenroll);

module.exports = router;
