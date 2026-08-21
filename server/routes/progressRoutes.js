const express = require('express');
const router = express.Router();
const progress = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.post('/complete-lecture', protect, progress.completeLecture);
router.get('/:userId/:courseId', protect, progress.getProgress);
router.put('/:userId/:courseId', protect, progress.updateProgress);
router.get('/:userId', protect, progress.getAllProgressForUser);

module.exports = router;
