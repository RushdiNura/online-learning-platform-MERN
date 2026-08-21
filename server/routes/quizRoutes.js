const express = require('express');
const router = express.Router();
const quiz = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', protect, quiz.getCourseQuizzes);
router.post('/', protect, authorize('instructor', 'admin'), quiz.createQuiz);
router.post('/:id/submit', protect, quiz.submitQuiz);
router.get('/:id/results', protect, quiz.getQuizResults);

module.exports = router;
